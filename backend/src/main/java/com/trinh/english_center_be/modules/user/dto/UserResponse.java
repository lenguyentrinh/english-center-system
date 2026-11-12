package com.trinh.english_center_be.modules.user.dto;

import com.trinh.english_center_be.shared.enums.UserStatus;

import java.time.LocalDateTime;
import java.util.List;

/** {@code roles} = the user's role codes (currently always one), so lists need no per-user call. */
public record UserResponse(
        String id,
        String username,
        String email,
        String fullName,
        String phone,
        UserStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<String> roles
) {
}
