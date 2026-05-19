package com.trinh.english_center_be.modules.user.dto;

import com.trinh.english_center_be.shared.enums.BusinessRoles;
import com.trinh.english_center_be.shared.enums.Roles;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RoleResponse {
    private Long id;
    private Roles code;
    private String description;
    private Boolean active;
    private Long businessRoleId;
    private BusinessRoles businessRoleCode;
}
