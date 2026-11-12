package com.trinh.english_center_be.modules.user.mapper;

import com.trinh.english_center_be.modules.user.dto.UserResponse;
import com.trinh.english_center_be.modules.user.entity.User;
import java.util.List;

public final class UserMapper {
    private UserMapper() {}

    public static UserResponse toResponse(User user) {
        return toResponse(user, List.of());
    }

    public static UserResponse toResponse(User user, List<String> roles) {
        if (user == null) return null;
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getStatus(),
                user.getCreatedAt(),
                user.getUpdateAt(),
                roles
        );
    }
}
