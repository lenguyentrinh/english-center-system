package com.trinh.english_center_be.modules.user.mapper;

import com.trinh.english_center_be.modules.user.dto.RoleResponse;
import com.trinh.english_center_be.modules.user.entity.Role;

public final class RoleMapper {
    private RoleMapper() {}

    public static RoleResponse toResponse(Role r) {
        if (r == null) return null;
        return new RoleResponse(
                r.getId(),
                r.getCode(),
                r.getDescription(),
                r.getActive(),
                r.getBusinessRole() != null ? r.getBusinessRole().getId() : null,
                r.getBusinessRole() != null ? r.getBusinessRole().getCode() : null
        );
    }
}
