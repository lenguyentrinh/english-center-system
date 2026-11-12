package com.trinh.english_center_be.modules.auth.repository;

import com.trinh.english_center_be.modules.auth.entity.RefreshToken;
import java.time.Instant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {

    /** Conditional revoke used for rotation; 1 means this caller won the race, 0 means it lost. */
    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update RefreshToken t set t.revoked = true, t.revokedAt = :now, t.replacedBy = :replacedBy "
            + "where t.id = :id and t.revoked = false")
    int claim(@Param("id") String id, @Param("now") Instant now, @Param("replacedBy") String replacedBy);

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update RefreshToken t set t.revoked = true, t.revokedAt = :now where t.id = :id and t.revoked = false")
    int revokeById(@Param("id") String id, @Param("now") Instant now);

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update RefreshToken t set t.revoked = true, t.revokedAt = :now "
            + "where t.userId = :userId and t.revoked = false")
    int revokeAllByUserId(@Param("userId") String userId, @Param("now") Instant now);

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from RefreshToken t where t.expiresAt < :cutoff")
    int deleteExpired(@Param("cutoff") Instant cutoff);
}
