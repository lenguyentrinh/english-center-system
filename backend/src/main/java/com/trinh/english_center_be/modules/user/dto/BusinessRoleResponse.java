package com.trinh.english_center_be.modules.user.dto;

import com.trinh.english_center_be.shared.enums.BusinessRoles;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class BusinessRoleResponse {
    private Long id;
    private BusinessRoles code;
    private String description;
    private Boolean active;
    private List<RoleResponse> roles;
    private LocalDateTime createdAt;
    private LocalDateTime updateAt;
}
