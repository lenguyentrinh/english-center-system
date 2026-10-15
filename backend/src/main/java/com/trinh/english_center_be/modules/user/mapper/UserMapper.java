package com.trinh.english_center_be.modules.user.mapper;

import com.trinh.english_center_be.modules.user.dto.UserResponse;
import com.trinh.english_center_be.modules.user.dto.UserEffectiveRolesResponse;
import com.trinh.english_center_be.modules.user.dto.RoleResponse;
import com.trinh.english_center_be.modules.user.dto.BusinessRoleResponse;
import com.trinh.english_center_be.modules.user.entity.User;
import java.util.List;
import java.util.Set;

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

    public static UserEffectiveRolesResponse toEffectiveRoles(User user,
                                                              Set<RoleResponse> directRoles,
                                                              Set<BusinessRoleResponse> businessRoles,
                                                              Set<RoleResponse> effectiveRoles) {
        if (user == null) return null;
        return new UserEffectiveRolesResponse(
                user.getId(),
                user.getUsername(),
                directRoles,
                businessRoles,
                effectiveRoles
        );
    }
}
