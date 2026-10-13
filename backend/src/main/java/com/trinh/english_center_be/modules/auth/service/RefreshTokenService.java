package com.trinh.english_center_be.modules.auth.service;

public interface RefreshTokenService {

    /** Result of a successful rotation: who the token belonged to and the replacement token. */
    record Rotated(String userId, String newRawToken) {}

    /** Issues a new refresh token for the user and returns the raw {@code id.secret} string. */
    String issue(String userId);

    /** Revokes {@code raw} and issues a replacement; throws {@code UnauthorizedException} if unusable. */
    Rotated rotate(String raw);

    /** Best-effort revoke of a single token (logout). Never throws for unknown/invalid tokens. */
    void revoke(String raw);

    void revokeAllForUser(String userId);
}
