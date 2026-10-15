package com.trinh.english_center_be.modules.user.dto;

import com.trinh.english_center_be.shared.enums.UserStatus;

import java.time.LocalDateTime;
import java.util.List;

/** {@code roles} = effective role codes (all rows of user_roles), so lists need no per-user /roles call. */
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
