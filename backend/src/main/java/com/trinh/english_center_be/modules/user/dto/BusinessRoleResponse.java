package com.trinh.english_center_be.modules.user.dto;

import com.trinh.english_center_be.shared.enums.BusinessRoles;

import java.time.LocalDateTime;
import java.util.List;

public record BusinessRoleResponse (
    Long id,
    BusinessRoles code,
    String description,
    Boolean active,
    LocalDateTime createdAt,
    LocalDateTime updateAt,
    List<RoleResponse> roles
){}
