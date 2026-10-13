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

/** Signup verification code; same shape and rules as {@link PasswordResetOtp}, separate collection. */
@Document(collection = "email_verification_otps")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerificationOtp {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private String otpHash;

    @Indexed(expireAfter = "0s")
    private Instant expiresAt;

    private int attempts;

    private Instant lastSentAt;
}
