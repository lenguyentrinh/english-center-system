package com.trinh.english_center_be.shared.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/**
 * Both cookies are HttpOnly, so scripts (XSS) can never read a token. The access cookie is sent
 * everywhere; the refresh cookie is scoped to {@code <context-path>/auth} so it only travels with the
 * few endpoints that need it.
 */
@Component
public class AuthCookieHelper {

    public static final String COOKIE_NAME = "AUTH_TOKEN";
    public static final String REFRESH_COOKIE_NAME = "REFRESH_TOKEN";

    @Value("${cookie.secure:false}")
    private boolean cookieSecure;

    /** Lax (default, same-origin/proxy setup), Strict or None (cross-site; requires Secure). */
    @Value("${cookie.same-site:Lax}")
    private String cookieSameSite;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Value("${jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    @Value("${server.servlet.context-path:/api}")
    private String contextPath;

    public ResponseCookie createAuthCookie(String token) {
        return base(COOKIE_NAME, token, "/").maxAge(toSeconds(jwtExpirationMs)).build();
    }

    public ResponseCookie createRefreshCookie(String token) {
        return base(REFRESH_COOKIE_NAME, token, refreshPath()).maxAge(toSeconds(refreshExpirationMs)).build();
    }

    /** Must use the same attributes (path, SameSite, Secure) as when set, otherwise the browser won't remove it. */
    public ResponseCookie clearAuthCookie() {
        return base(COOKIE_NAME, "", "/").maxAge(0).build();
    }

    public ResponseCookie clearRefreshCookie() {
        return base(REFRESH_COOKIE_NAME, "", refreshPath()).maxAge(0).build();
    }

    private ResponseCookie.ResponseCookieBuilder base(String name, String value, String path) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(isSecure())
                .sameSite(cookieSameSite)
                .path(path);
    }

    private String refreshPath() {
        String prefix = contextPath == null ? "" : contextPath.replaceAll("/+$", "");
        return prefix + "/auth";
    }

    /** Browsers reject SameSite=None without Secure, so force it. */
    private boolean isSecure() {
        return cookieSecure || "None".equalsIgnoreCase(cookieSameSite);
    }

    /** Cookie Max-Age is in seconds (not milliseconds). */
    private static long toSeconds(long millis) {
        return Math.max(1L, millis / 1000L);
    }
}
