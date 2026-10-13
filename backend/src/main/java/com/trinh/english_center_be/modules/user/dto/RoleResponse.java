package com.trinh.english_center_be.modules.user.dto;

import com.trinh.english_center_be.shared.enums.BusinessRoles;
import com.trinh.english_center_be.shared.enums.Roles;

public record RoleResponse (
    String id,
    Roles code,
    String description,
    Boolean active,
    String businessRoleId,
    BusinessRoles businessRoleCode
){}
