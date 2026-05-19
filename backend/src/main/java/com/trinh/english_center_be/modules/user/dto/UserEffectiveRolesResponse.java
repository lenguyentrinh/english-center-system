package com.trinh.english_center_be.modules.user.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.Set;

@Getter
@Builder
public class UserEffectiveRolesResponse {
    private Long userId;
    private String username;
    private Set<RoleResponse> directRoles;
    private Set<BusinessRoleResponse> businessRoles;
    private Set<RoleResponse> effectiveRoles;
}
