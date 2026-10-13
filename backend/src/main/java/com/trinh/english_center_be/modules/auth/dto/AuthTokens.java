package com.trinh.english_center_be.modules.auth.dto;

/** Server-side pair handed to the controller, which puts both in HttpOnly cookies (never in the body). */
public record AuthTokens(String accessToken, String refreshToken) {}
