package com.trinh.english_center_be.modules.auth.service.impl;

import com.trinh.english_center_be.modules.auth.entity.EmailVerificationOtp;
import com.trinh.english_center_be.modules.auth.service.EmailVerificationService;
import com.trinh.english_center_be.modules.auth.service.MailService;
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
import org.springframework.stereotype.Service;

/**
 * Same safeguards as the password-reset flow: HMAC-stored code, attempt counter incremented before the
 * comparison, atomic consume. The HMAC input is prefixed with a purpose so a verification code can never
 * be replayed as a reset code (or the other way round).
 */
@Service
@RequiredArgsConstructor
public class EmailVerificationServiceImpl implements EmailVerificationService {

    private static final int MAX_ATTEMPTS = 5;
    private static final Duration RESEND_COOLDOWN = Duration.ofSeconds(60);
    private static final String INVALID_CODE = "Invalid or expired code";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserService userService;
    private final MailService mailService;
    private final MongoTemplate mongoTemplate;

    @Value("${auth.otp.ttl-minutes:5}")
    private long ttlMinutes;

    @Value("${auth.otp.secret:${jwt.secret}}")
    private String otpSecret;

    @Override
    public void sendCode(String email) {
        Optional<User> found = userService.findByEmail(email.trim())
                .filter(u -> u.getStatus() == UserStatus.ACTIVE && !u.isEmailVerified());
        if (found.isEmpty()) return;

        User user = found.get();
        Instant now = Instant.now();

        EmailVerificationOtp existing = mongoTemplate.findOne(
                Query.query(Criteria.where("userId").is(user.getId())), EmailVerificationOtp.class);
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
                EmailVerificationOtp.class);

        mailService.sendEmailVerificationOtp(user.getEmail(), user.getFullName(), otp);
    }

    @Override
    public void verify(String email, String otp) {
        User user = userService.findByEmail(email.trim())
                .filter(u -> u.getStatus() == UserStatus.ACTIVE && !u.isEmailVerified())
                .orElseThrow(EmailVerificationServiceImpl::invalidCode);

        EmailVerificationOtp row = mongoTemplate.findAndModify(
                Query.query(Criteria.where("userId").is(user.getId())),
                new Update().inc("attempts", 1),
                FindAndModifyOptions.options().returnNew(true),
                EmailVerificationOtp.class);
        if (row == null || !row.getExpiresAt().isAfter(Instant.now()) || row.getAttempts() > MAX_ATTEMPTS) {
            throw invalidCode();
        }

        String expected = hmac(user.getId(), otp);
        if (!MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),
                row.getOtpHash().getBytes(StandardCharsets.UTF_8))) {
            throw invalidCode();
        }

        // Atomic consume: of two concurrent requests with the right code only one gets the document.
        EmailVerificationOtp consumed = mongoTemplate.findAndRemove(
                Query.query(Criteria.where("userId").is(user.getId()).and("otpHash").is(expected)),
                EmailVerificationOtp.class);
        if (consumed == null) throw invalidCode();

        user.setEmailVerified(true);
        userService.save(user);
    }

    private String hmac(String userId, String otp) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(otpSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(
                    mac.doFinal(("verify-email:" + userId + ":" + otp).getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }

    private static BusinessException invalidCode() {
        return new BusinessException(INVALID_CODE, HttpStatus.BAD_REQUEST);
    }
}
