package com.trinh.english_center_be.shared.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class AuthCookieHelper {

    public static final String COOKIE_NAME = "AUTH_TOKEN";

    @Value("${cookie.secure:false}")
    private boolean cookieSecure;

    /** Lax (default, same-origin/proxy setup), Strict or None (cross-site; requires Secure). */
    @Value("${cookie.same-site:Lax}")
    private String cookieSameSite;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    public ResponseCookie createAuthCookie(String token) {
        return ResponseCookie.from(COOKIE_NAME, token)
                .httpOnly(true)
                .secure(isSecure())
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(cookieMaxAgeSeconds())
                .build();
    }

    /** Must use the same attributes as createAuthCookie, otherwise the browser won't remove it. */
    public ResponseCookie clearAuthCookie() {
        return ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .secure(isSecure())
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(0)
                .build();
    }

    /** Browsers reject SameSite=None without Secure, so force it. */
    private boolean isSecure() {
        return cookieSecure || "None".equalsIgnoreCase(cookieSameSite);
    }

    /** Cookie Max-Age is in seconds (not milliseconds). */
    public long cookieMaxAgeSeconds() {
        return Math.max(1L, jwtExpirationMs / 1000L);
    }
}
