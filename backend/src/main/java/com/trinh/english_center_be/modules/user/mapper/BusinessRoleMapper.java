package com.trinh.english_center_be.modules.user.mapper;

import com.trinh.english_center_be.modules.user.dto.BusinessRoleResponse;
import com.trinh.english_center_be.modules.user.dto.RoleResponse;
import com.trinh.english_center_be.modules.user.entity.BusinessRole;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public final class BusinessRoleMapper {
    private BusinessRoleMapper() {}

    public static BusinessRoleResponse toResponse(BusinessRole businessRole) {
        if (businessRole == null) return null;
        List<RoleResponse> roles = businessRole.getRoles() == null ? List.of() :
                businessRole.getRoles().stream()
                        .filter(r -> Boolean.TRUE.equals(r.getActive()))
                        .map(RoleMapper::toResponse)
                        .toList();

        return new BusinessRoleResponse(
                businessRole.getId(),
                businessRole.getCode(),
                businessRole.getDescription(),
                businessRole.getActive(),
                businessRole.getCreatedAt(),
                businessRole.getUpdateAt(),
                roles
        );
    }

    public static BusinessRoleResponse toOverview(BusinessRole businessRole) {
        if (businessRole == null) return null;
        return new BusinessRoleResponse(
                businessRole.getId(),
                businessRole.getCode(),
                businessRole.getDescription(),
                businessRole.getActive(),
                businessRole.getCreatedAt(),
                businessRole.getUpdateAt(),
                List.of()
        );
    }

    public static BusinessRoleResponse toResponseWithAssignedRoles(BusinessRole businessRole, Set<RoleResponse> assignedRoles) {
        if (businessRole == null) return null;
        return new BusinessRoleResponse(
                businessRole.getId(),
                businessRole.getCode(),
                businessRole.getDescription(),
                businessRole.getActive(),
                businessRole.getCreatedAt(),
                businessRole.getUpdateAt(),
                assignedRoles == null ? List.of() : assignedRoles.stream().toList()
        );
    }
}
