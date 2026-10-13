package com.trinh.english_center_be.shared.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Fixed-window limiter (per client IP and endpoint) for the unauthenticated credential endpoints.
 * In-memory, so it is per instance; put a gateway/Redis limiter in front when running several replicas.
 * The client IP comes from {@code getRemoteAddr()}, which honours X-Forwarded-For only because
 * {@code server.forward-headers-strategy=framework} is set: keep that tied to a trusted proxy.
 */
@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private static final Set<String> LIMITED_PATHS = Set.of(
            "/auth/login", "/auth/signup", "/auth/forgot-password", "/auth/verify-otp", "/auth/reset-password",
            "/auth/verify-email", "/auth/resend-verification");

    private record Window(long startedAt, AtomicInteger count) {}

    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    @Value("${auth.rate-limit.max-requests:10}")
    private int maxRequests;

    @Value("${auth.rate-limit.window-seconds:60}")
    private long windowSeconds;

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        return !"POST".equals(request.getMethod()) || !LIMITED_PATHS.contains(request.getServletPath());
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        long now = System.currentTimeMillis();
        long windowMs = windowSeconds * 1000L;
        String key = request.getRemoteAddr() + "|" + request.getServletPath();

        Window window = windows.compute(key, (k, w) ->
                w == null || now - w.startedAt() >= windowMs ? new Window(now, new AtomicInteger(0)) : w);
        int used = window.count().incrementAndGet();

        if (windows.size() > 10_000) {
            windows.entrySet().removeIf(e -> now - e.getValue().startedAt() >= windowMs);
        }

        if (used > maxRequests) {
            long retryAfter = Math.max(1L, (window.startedAt() + windowMs - now + 999) / 1000);
            response.setStatus(429);
            response.setHeader("Retry-After", String.valueOf(retryAfter));
            response.setContentType("application/json");
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.getWriter().write(
                    "{\"message\":\"Too many requests, please try again later\",\"status\":\"TOO_MANY_REQUESTS\",\"origin\":\"rate-limit\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
