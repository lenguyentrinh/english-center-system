package com.trinh.english_center_be.modules.auth.service.impl;

import com.trinh.english_center_be.modules.auth.dto.ResetPasswordRequest;
import com.trinh.english_center_be.modules.auth.entity.PasswordResetOtp;
import com.trinh.english_center_be.modules.auth.service.MailService;
import com.trinh.english_center_be.modules.auth.service.PasswordResetService;
import com.trinh.english_center_be.modules.auth.service.RefreshTokenService;
import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.modules.user.service.UserService;
import com.trinh.english_center_be.shared.enums.UserStatus;
import com.trinh.english_center_be.shared.exception.BusinessException;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Forgot-password flow with a 6-digit emailed code.
 *
 * <ul>
 *   <li>The code is stored as an HMAC (keyed with a server secret), so a database leak alone does not
 *       reveal live codes; a 6-digit space makes a plain hash trivially brute-forceable.</li>
 *   <li>Every check first atomically increments {@code attempts}; once the limit is passed the code is
 *       dead, so parallel guessing cannot exceed {@code MAX_ATTEMPTS} comparisons.</li>
 *   <li>{@code verifyOtp} does not consume the code. {@code resetPassword} re-validates and consumes it
 *       with an atomic find-and-remove, so the frontend "having passed the verify step" proves nothing.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {

    private static final int MAX_ATTEMPTS = 5;
    private static final Duration RESEND_COOLDOWN = Duration.ofSeconds(60);
    private static final String INVALID_CODE = "Invalid or expired code";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserService userService;
    private final MailService mailService;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;
    private final MongoTemplate mongoTemplate;

    @Value("${auth.otp.ttl-minutes:5}")
    private long ttlMinutes;

    @Value("${auth.otp.secret:${jwt.secret}}")
    private String otpSecret;

    @Override
    public void requestReset(String email) {
        Optional<User> found = userService.findByEmail(email.trim())
                .filter(u -> u.getStatus() == UserStatus.ACTIVE);
        if (found.isEmpty()) return;

        User user = found.get();
        Instant now = Instant.now();

        PasswordResetOtp existing = mongoTemplate.findOne(
                Query.query(Criteria.where("userId").is(user.getId())), PasswordResetOtp.class);
        if (existing != null && existing.getLastSentAt() != null
                && existing.getLastSentAt().plus(RESEND_COOLDOWN).isAfter(now)) {
            return;
        }

        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));
        mongoTemplate.upsert(
                Query.query(Criteria.where("userId").is(user.getId())),
                new Update()
                        .set("otpHash", hmac(user.getId(), otp))
                        .set("expiresAt", now.plus(Duration.ofMinutes(ttlMinutes)))
                        .set("attempts", 0)
                        .set("lastSentAt", now),
                PasswordResetOtp.class);

        mailService.sendPasswordResetOtp(user.getEmail(), user.getFullName(), otp);
    }

    @Override
    public void verifyOtp(String email, String otp) {
        User user = activeUserOrInvalid(email);
        PasswordResetOtp row = countAttempt(user.getId());
        if (!matches(row, user.getId(), otp)) throw invalidCode();

        // A correct code clears the typo counter so the reset step still has its full budget.
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("userId").is(user.getId())),
                new Update().set("attempts", 0),
                PasswordResetOtp.class);
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        User user = activeUserOrInvalid(request.email());
        PasswordResetOtp row = countAttempt(user.getId());
        if (!matches(row, user.getId(), request.otp())) throw invalidCode();

        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new BusinessException("New password must be different from the current password",
                    HttpStatus.BAD_REQUEST);
        }

        // Consume atomically: of two concurrent requests with the right code only one gets the document.
        PasswordResetOtp consumed = mongoTemplate.findAndRemove(
                Query.query(Criteria.where("userId").is(user.getId()).and("otpHash").is(row.getOtpHash())),
                PasswordResetOtp.class);
        if (consumed == null) throw invalidCode();

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        // Receiving the reset code proves control of the inbox.
        user.setEmailVerified(true);
        userService.save(user);
        refreshTokenService.revokeAllForUser(user.getId());
    }

    private User activeUserOrInvalid(String email) {
        return userService.findByEmail(email.trim())
                .filter(u -> u.getStatus() == UserStatus.ACTIVE)
                .orElseThrow(PasswordResetServiceImpl::invalidCode);
    }

    /** Atomically bumps the attempt counter and returns the document, or fails if absent/expired/exhausted. */
    private PasswordResetOtp countAttempt(String userId) {
        PasswordResetOtp row = mongoTemplate.findAndModify(
                Query.query(Criteria.where("userId").is(userId)),
                new Update().inc("attempts", 1),
                FindAndModifyOptions.options().returnNew(true),
                PasswordResetOtp.class);

        if (row == null || !row.getExpiresAt().isAfter(Instant.now()) || row.getAttempts() > MAX_ATTEMPTS) {
            throw invalidCode();
        }
        return row;
    }

    private boolean matches(PasswordResetOtp row, String userId, String otp) {
        return MessageDigest.isEqual(
                hmac(userId, otp).getBytes(StandardCharsets.UTF_8),
                row.getOtpHash().getBytes(StandardCharsets.UTF_8));
    }

    private String hmac(String userId, String otp) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(otpSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal((userId + ":" + otp).getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }

    private static BusinessException invalidCode() {
        return new BusinessException(INVALID_CODE, HttpStatus.BAD_REQUEST);
    }
}
