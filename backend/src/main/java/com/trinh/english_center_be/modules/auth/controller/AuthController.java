package com.trinh.english_center_be.modules.auth.controller;

import com.trinh.english_center_be.modules.auth.dto.LoginRequest;
import com.trinh.english_center_be.modules.auth.dto.SignupRequest;
import com.trinh.english_center_be.modules.auth.service.AuthService;
import com.trinh.english_center_be.shared.config.AuthCookieHelper;
import com.trinh.english_center_be.shared.response.ApiResponse;
import com.trinh.english_center_be.shared.util.MessageConstant;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final AuthCookieHelper authCookieHelper;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<Void>> signup(@RequestBody @Valid SignupRequest request) {
        authService.signup(request);
        return ResponseEntity.ok()
                .body(new ApiResponse<>(200,  MessageConstant.SIGNUP_SUCCESS, null));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Void>> login(@RequestBody @Valid LoginRequest request) {
        String token = authService.authenticate(request);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookieHelper.createAuthCookie(token).toString())
                .body(new ApiResponse<>(200, MessageConstant.LOGIN_SUCCESS, null));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookieHelper.clearAuthCookie().toString())
                .body(new ApiResponse<>(200, MessageConstant.LOGOUT_SUCCESS, null));
    }
}
