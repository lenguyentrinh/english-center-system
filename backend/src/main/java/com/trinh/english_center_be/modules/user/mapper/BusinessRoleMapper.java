package com.trinh.english_center_be.modules.user.mapper;

import com.trinh.english_center_be.modules.user.dto.BusinessRoleResponse;
import com.trinh.english_center_be.modules.user.dto.RoleResponse;
import com.trinh.english_center_be.modules.user.entity.BusinessRole;
import com.trinh.english_center_be.modules.user.entity.Role;

import java.util.List;
import java.util.Set;

public final class BusinessRoleMapper {
    private BusinessRoleMapper() {}

    /**
     * @param roles roles that belong to the business role, loaded by the caller through
     *              RoleRepository.findByBusinessRole; inactive roles are filtered out here
     */
    public static BusinessRoleResponse toResponse(BusinessRole businessRole, List<Role> roles) {
        if (businessRole == null) return null;
        List<RoleResponse> roleResponses = roles == null ? List.of() :
                roles.stream()
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
                roleResponses
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
