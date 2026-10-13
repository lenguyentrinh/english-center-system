package com.trinh.english_center_be.modules.auth.controller;

import com.trinh.english_center_be.modules.auth.dto.AuthTokens;
import com.trinh.english_center_be.modules.auth.dto.ChangePasswordRequest;
import com.trinh.english_center_be.modules.auth.dto.ForgotPasswordRequest;
import com.trinh.english_center_be.modules.auth.dto.LoginRequest;
import com.trinh.english_center_be.modules.auth.dto.MeResponse;
import com.trinh.english_center_be.modules.auth.dto.ResetPasswordRequest;
import com.trinh.english_center_be.modules.auth.dto.SignupRequest;
import com.trinh.english_center_be.modules.auth.dto.VerifyOtpRequest;
import com.trinh.english_center_be.modules.auth.security.AuthUserDetails;
import com.trinh.english_center_be.modules.auth.dto.VerifyEmailRequest;
import com.trinh.english_center_be.modules.auth.service.AuthService;
import com.trinh.english_center_be.modules.auth.service.EmailVerificationService;
import com.trinh.english_center_be.modules.auth.service.PasswordResetService;
import com.trinh.english_center_be.shared.config.AuthCookieHelper;
import com.trinh.english_center_be.shared.exception.UnauthorizedException;
import com.trinh.english_center_be.shared.response.ApiResponse;
import com.trinh.english_center_be.shared.util.MessageConstant;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    private final EmailVerificationService emailVerificationService;
    private final AuthCookieHelper authCookieHelper;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<Void>> signup(@RequestBody @Valid SignupRequest request) {
        authService.signup(request);
        return ResponseEntity.ok()
                .body(new ApiResponse<>(200, MessageConstant.SIGNUP_VERIFY_EMAIL, null));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestBody @Valid VerifyEmailRequest request) {
        emailVerificationService.verify(request.email(), request.otp());
        return ResponseEntity.ok(new ApiResponse<>(200, MessageConstant.EMAIL_VERIFIED, null));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerification(@RequestBody @Valid ForgotPasswordRequest request) {
        emailVerificationService.sendCode(request.email());
        // Same answer whether or not the email exists / is already verified.
        return ResponseEntity.ok(new ApiResponse<>(200, MessageConstant.RESEND_VERIFICATION_SENT, null));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Void>> login(@RequestBody @Valid LoginRequest request) {
        return withSession(authService.login(request), MessageConstant.LOGIN_SUCCESS);
    }

    /** Called by the frontend interceptor when the access cookie expired; rotates the refresh token. */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Void>> refresh(
            @CookieValue(name = AuthCookieHelper.REFRESH_COOKIE_NAME, required = false) String refreshToken
    ) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }
        return withSession(authService.refresh(refreshToken), MessageConstant.REFRESH_SUCCESS);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = AuthCookieHelper.REFRESH_COOKIE_NAME, required = false) String refreshToken
    ) {
        authService.logout(refreshToken);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookieHelper.clearAuthCookie().toString())
                .header(HttpHeaders.SET_COOKIE, authCookieHelper.clearRefreshCookie().toString())
                .body(new ApiResponse<>(200, MessageConstant.LOGOUT_SUCCESS, null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MeResponse>> me(@AuthenticationPrincipal AuthUserDetails principal) {
        return ResponseEntity.ok(new ApiResponse<>(200, MessageConstant.ME_SUCCESS, authService.me(principal.getId())));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal AuthUserDetails principal,
            @RequestBody @Valid ChangePasswordRequest request
    ) {
        return withSession(authService.changePassword(principal.getId(), request),
                MessageConstant.PASSWORD_CHANGED);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
        passwordResetService.requestReset(request.email());
        // Same answer whether or not the email exists.
        return ResponseEntity.ok(new ApiResponse<>(200, MessageConstant.FORGOT_PASSWORD_SENT, null));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(@RequestBody @Valid VerifyOtpRequest request) {
        passwordResetService.verifyOtp(request.email(), request.otp());
        return ResponseEntity.ok(new ApiResponse<>(200, MessageConstant.OTP_VALID, null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
        return ResponseEntity.ok()
                // Any session on this browser is dead now (all refresh tokens were revoked).
                .header(HttpHeaders.SET_COOKIE, authCookieHelper.clearAuthCookie().toString())
                .header(HttpHeaders.SET_COOKIE, authCookieHelper.clearRefreshCookie().toString())
                .body(new ApiResponse<>(200, MessageConstant.PASSWORD_RESET_SUCCESS, null));
    }

    private ResponseEntity<ApiResponse<Void>> withSession(AuthTokens tokens, String message) {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookieHelper.createAuthCookie(tokens.accessToken()).toString())
                .header(HttpHeaders.SET_COOKIE, authCookieHelper.createRefreshCookie(tokens.refreshToken()).toString())
                .body(new ApiResponse<>(200, message, null));
    }
}
