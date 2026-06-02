package com.trinh.english_center_be.modules.user.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.Set;

@Builder
public record UserEffectiveRolesResponse (
     Long userId,
     String username,
     Set<RoleResponse> directRoles,
     Set<BusinessRoleResponse> businessRoles,
     Set<RoleResponse> effectiveRoles
){}
