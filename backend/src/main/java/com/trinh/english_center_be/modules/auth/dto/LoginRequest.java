package com.trinh.english_center_be.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Login must not reveal the password policy, so only presence and an upper bound are checked here.
 * {@code username} also accepts the account's email address.
 */
public record LoginRequest(
        @NotBlank
        @Size(max = 100)
        String username,

        @NotBlank
        @Size(max = 255)
        String password
) {}
