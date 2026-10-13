package com.trinh.english_center_be.modules.auth.service;

import com.trinh.english_center_be.modules.auth.dto.AuthTokens;
import com.trinh.english_center_be.modules.auth.dto.ChangePasswordRequest;
import com.trinh.english_center_be.modules.auth.dto.LoginRequest;
import com.trinh.english_center_be.modules.auth.dto.MeResponse;
import com.trinh.english_center_be.modules.auth.dto.SignupRequest;

public interface AuthService {
    AuthTokens login(LoginRequest loginRequest);
    void signup(SignupRequest request);

    /** Rotates the refresh token and returns a fresh access/refresh pair. */
    AuthTokens refresh(String rawRefreshToken);

    /** Revokes the presented refresh token; safe to call with null/invalid input. */
    void logout(String rawRefreshToken);

    MeResponse me(String userId);

    /** Verifies the current password, sets the new one, ends every other session and returns a fresh pair. */
    AuthTokens changePassword(String userId, ChangePasswordRequest request);
}
