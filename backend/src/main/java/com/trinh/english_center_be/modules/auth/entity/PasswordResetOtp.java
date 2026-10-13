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

/** At most one active reset code per user; requesting a new one replaces the old one. */
@Document(collection = "password_reset_otps")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetOtp {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    /** HMAC-SHA256 of the code, never the code itself. */
    private String otpHash;

    @Indexed(expireAfter = "0s")
    private Instant expiresAt;

    private int attempts;

    private Instant lastSentAt;
}
