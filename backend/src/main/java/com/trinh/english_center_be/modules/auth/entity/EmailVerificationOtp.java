package com.trinh.english_center_be.modules.auth.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Signup verification code; same shape and rules as {@link PasswordResetOtp}, separate collection. */
@Entity
@Table(name = "email_verification_otps",
        indexes = @Index(name = "idx_email_otp_expires", columnList = "expires_at"))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerificationOtp {

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;

    @Column(unique = true)
    private String userId;

    private String otpHash;
    private Instant expiresAt;

    private int attempts;

    private Instant lastSentAt;
}
