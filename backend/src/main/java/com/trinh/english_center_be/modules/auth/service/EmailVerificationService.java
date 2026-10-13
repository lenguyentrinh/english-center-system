package com.trinh.english_center_be.modules.auth.service;

public interface EmailVerificationService {

    /** Issues and emails a code. Silent no-op unless the account exists, is active and is unverified. */
    void sendCode(String email);

    /** Checks and consumes the code, then marks the email verified. Generic 400 on any failure. */
    void verify(String email, String otp);
}
