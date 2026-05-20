package com.trinh.english_center_be.modules.user.dto;

import com.trinh.english_center_be.shared.enums.UserStatus;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String username,
        String email,
        String fullName,
        String phone,
        UserStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
