package com.trinh.english_center_be.modules.auth.service;

import com.trinh.english_center_be.modules.auth.dto.LoginRequest;
import com.trinh.english_center_be.modules.auth.dto.SignupRequest;

public interface AuthService {
    String authenticate(LoginRequest loginRequest);
    void signup(SignupRequest request);
}
