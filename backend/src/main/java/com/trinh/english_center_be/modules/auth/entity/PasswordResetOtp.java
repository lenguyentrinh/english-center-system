package com.trinh.english_center_be.modules.auth.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** At most one active reset code per user; requesting a new one replaces the old one. */
@Entity
@Table(name = "password_reset_otps",
        indexes = @Index(name = "idx_reset_otp_expires", columnList = "expires_at"))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetOtp {

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;

    @Column(unique = true)
    private String userId;

    /** HMAC-SHA256 of the code, never the code itself. */
    private String otpHash;
    private Instant expiresAt;

    private int attempts;

    private Instant lastSentAt;
}
