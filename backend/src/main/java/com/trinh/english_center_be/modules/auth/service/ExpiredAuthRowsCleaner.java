package com.trinh.english_center_be.modules.auth.service;

import com.trinh.english_center_be.modules.auth.repository.EmailVerificationOtpRepository;
import com.trinh.english_center_be.modules.auth.repository.PasswordResetOtpRepository;
import com.trinh.english_center_be.modules.auth.repository.RefreshTokenRepository;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * MySQL has no TTL index, so expired OTPs and refresh tokens are purged periodically.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ExpiredAuthRowsCleaner {

    private final RefreshTokenRepository refreshTokens;
    private final PasswordResetOtpRepository resetOtps;
    private final EmailVerificationOtpRepository verificationOtps;

    @Scheduled(fixedDelay = 3_600_000L, initialDelay = 60_000L)
    public void purge() {
        Instant now = Instant.now();
        int tokens = refreshTokens.deleteExpired(now);
        int resets = resetOtps.deleteExpired(now);
        int verifications = verificationOtps.deleteExpired(now);
        if (tokens + resets + verifications > 0) {
            log.debug("Purged {} refresh tokens, {} reset codes, {} verification codes", tokens, resets, verifications);
        }
    }
}
