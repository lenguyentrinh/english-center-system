package com.trinh.english_center_be.modules.auth.service.impl;

import com.trinh.english_center_be.modules.auth.entity.RefreshToken;
import com.trinh.english_center_be.modules.auth.repository.RefreshTokenRepository;
import com.trinh.english_center_be.modules.auth.service.RefreshTokenService;
import com.trinh.english_center_be.modules.user.service.UserService;
import com.trinh.english_center_be.shared.exception.UnauthorizedException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

/**
 * Rotating refresh tokens. Raw token = {@code <rowId>.<secret>}: the row id lets us load one document
 * directly, the secret is 256 random bits so a plain SHA-256 is enough (no bcrypt needed for a
 * high-entropy value) and keeps the hot refresh path cheap.
 *
 * <p>Rotation uses a conditional update ({@code revoked:false -> true}) so exactly one concurrent
 * request wins; this needs no Mongo transaction (works on a standalone mongod).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    /** Several browser tabs refreshing at once is normal; losers inside this window are not an attack. */
    private static final Duration REUSE_GRACE_WINDOW = Duration.ofSeconds(10);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final RefreshTokenRepository repository;
    private final MongoTemplate mongoTemplate;
    private final UserService userService;

    @Value("${jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    @Override
    public String issue(String userId) {
        String id = new ObjectId().toHexString();
        String secret = newSecret();
        Instant now = Instant.now();

        repository.save(RefreshToken.builder()
                .id(id)
                .userId(userId)
                .tokenHash(hash(secret))
                .createdAt(now)
                .expiresAt(now.plusMillis(refreshExpirationMs))
                .revoked(false)
                .build());

        return id + "." + secret;
    }

    @Override
    public Rotated rotate(String raw) {
        RefreshToken row = findValid(raw);
        Instant now = Instant.now();

        if (row.isRevoked()) {
            handleRevoked(row, now);
        }
        if (!row.getExpiresAt().isAfter(now)) {
            throw invalid();
        }
        if (!userService.isUserActive(row.getUserId())) {
            revokeAllForUser(row.getUserId());
            throw invalid();
        }

        String newId = new ObjectId().toHexString();
        RefreshToken claimed = mongoTemplate.findAndModify(
                Query.query(Criteria.where("id").is(row.getId()).and("revoked").is(false)),
                new Update().set("revoked", true).set("revokedAt", now).set("replacedBy", newId),
                FindAndModifyOptions.options().returnNew(false),
                RefreshToken.class);

        if (claimed == null) {
            // Lost the race against a concurrent refresh of the same token.
            RefreshToken fresh = repository.findById(row.getId()).orElseThrow(RefreshTokenServiceImpl::invalid);
            handleRevoked(fresh, now);
            throw invalid();
        }

        String secret = newSecret();
        repository.save(RefreshToken.builder()
                .id(newId)
                .userId(row.getUserId())
                .tokenHash(hash(secret))
                .createdAt(now)
                .expiresAt(now.plusMillis(refreshExpirationMs))
                .revoked(false)
                .build());

        return new Rotated(row.getUserId(), newId + "." + secret);
    }

    @Override
    public void revoke(String raw) {
        try {
            RefreshToken row = findValid(raw);
            mongoTemplate.updateFirst(
                    Query.query(Criteria.where("id").is(row.getId()).and("revoked").is(false)),
                    new Update().set("revoked", true).set("revokedAt", Instant.now()),
                    RefreshToken.class);
        } catch (UnauthorizedException ignored) {
            // Logging out with a bad or already-dead token is fine.
        }
    }

    @Override
    public void revokeAllForUser(String userId) {
        mongoTemplate.updateMulti(
                Query.query(Criteria.where("userId").is(userId).and("revoked").is(false)),
                new Update().set("revoked", true).set("revokedAt", Instant.now()),
                RefreshToken.class);
    }

    /** A revoked token presented again: inside the grace window it is a lost race, outside it is replay. */
    private void handleRevoked(RefreshToken row, Instant now) {
        Instant revokedAt = row.getRevokedAt();
        boolean raced = revokedAt != null && Duration.between(revokedAt, now).compareTo(REUSE_GRACE_WINDOW) < 0;
        if (!raced) {
            log.warn("Refresh token reuse detected for user {}; revoking all sessions", row.getUserId());
            revokeAllForUser(row.getUserId());
        }
        throw invalid();
    }

    private RefreshToken findValid(String raw) {
        if (raw == null) throw invalid();
        int dot = raw.indexOf('.');
        if (dot <= 0 || dot == raw.length() - 1) throw invalid();

        String id = raw.substring(0, dot);
        String secret = raw.substring(dot + 1);
        if (!ObjectId.isValid(id)) throw invalid();

        RefreshToken row = repository.findById(id).orElseThrow(RefreshTokenServiceImpl::invalid);
        boolean matches = MessageDigest.isEqual(
                hash(secret).getBytes(StandardCharsets.UTF_8),
                row.getTokenHash().getBytes(StandardCharsets.UTF_8));
        if (!matches) throw invalid();
        return row;
    }

    private static UnauthorizedException invalid() {
        return new UnauthorizedException("Invalid or expired refresh token");
    }

    private static String newSecret() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hash(String secret) {
        try {
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(secret.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
