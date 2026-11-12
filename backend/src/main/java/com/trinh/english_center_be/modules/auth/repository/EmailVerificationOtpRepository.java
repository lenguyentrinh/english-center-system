package com.trinh.english_center_be.modules.auth.repository;

import com.trinh.english_center_be.modules.auth.entity.EmailVerificationOtp;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface EmailVerificationOtpRepository extends JpaRepository<EmailVerificationOtp, String> {

    Optional<EmailVerificationOtp> findByUserId(String userId);

    /** Atomic counter bump; returns the number of rows touched (0 when there is no code). */
    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update EmailVerificationOtp o set o.attempts = o.attempts + 1 where o.userId = :userId")
    int incrementAttempts(@Param("userId") String userId);

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update EmailVerificationOtp o set o.attempts = 0 where o.userId = :userId")
    int resetAttempts(@Param("userId") String userId);

    /** Atomic consume: of two concurrent callers with the right code only one gets a count of 1. */
    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from EmailVerificationOtp o where o.userId = :userId and o.otpHash = :otpHash")
    int consume(@Param("userId") String userId, @Param("otpHash") String otpHash);

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from EmailVerificationOtp o where o.expiresAt < :cutoff")
    int deleteExpired(@Param("cutoff") Instant cutoff);
}
