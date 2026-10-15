package com.trinh.english_center_be.modules.auth.service;

import com.trinh.english_center_be.modules.auth.dto.ResetPasswordRequest;

public interface PasswordResetService {

    /** Always completes silently, whether or not the email belongs to an active account. */
    void requestReset(String email);

    /**
     * Same code as {@link #requestReset} but mailed as an account invitation: an admin-created user sets their own
     * password with it on the forgot-password screen. Silent for unknown/inactive accounts.
     */
    void requestInvite(String email);

    /** Checks a code without consuming it. Throws a generic 400 when it is wrong or expired. */
    void verifyOtp(String email, String otp);

    /** Re-validates the code server-side, consumes it, sets the password and revokes all sessions. */
    void resetPassword(ResetPasswordRequest request);
}
