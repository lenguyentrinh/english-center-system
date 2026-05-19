package com.trinh.english_center_be.shared.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class AuthCookieHelper {

    public static final String COOKIE_NAME = "AUTH_TOKEN";

    @Value("${cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    public ResponseCookie createAuthCookie(String token) {
        return ResponseCookie.from(COOKIE_NAME, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path("/")
                .maxAge(cookieMaxAgeSeconds())
                .build();
    }

    public ResponseCookie clearAuthCookie() {
        return ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
    }

    /** Cookie Max-Age is in seconds (not milliseconds). */
    public long cookieMaxAgeSeconds() {
        return Math.max(1L, jwtExpirationMs / 1000L);
    }
}
