package com.trinh.english_center_be.modules.auth.entity;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * One row per issued refresh token. The client holds an opaque {@code <id>.<secret>} string; only the
 * SHA-256 of the secret is stored. Timestamps are {@link Instant} (stored as BSON dates, unlike the
 * ISO-string LocalDateTime mapping in MongoConfig) so the TTL index can purge expired rows.
 */
@Document(collection = "refresh_tokens")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String tokenHash;

    @Indexed(expireAfter = "0s")
    private Instant expiresAt;

    private boolean revoked;

    private Instant revokedAt;

    private String replacedBy;

    private Instant createdAt;
}
