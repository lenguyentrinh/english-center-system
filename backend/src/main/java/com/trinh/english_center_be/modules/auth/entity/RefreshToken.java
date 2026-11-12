package com.trinh.english_center_be.modules.auth.entity;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One row per issued refresh token. The client holds an opaque {@code <id>.<secret>} string; only the
 * SHA-256 of the secret is stored. Expired rows are purged by {@code ExpiredAuthRowsCleaner}.
 */
@Entity
@Table(name = "refresh_tokens",
        indexes = {@Index(name = "idx_refresh_user", columnList = "user_id"), @Index(name = "idx_refresh_expires", columnList = "expires_at")})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {

    @Id
    @Column(length = 32)
    private String id;
    private String userId;

    private String tokenHash;
    private Instant expiresAt;

    private boolean revoked;

    private Instant revokedAt;

    private String replacedBy;

    private Instant createdAt;
}
