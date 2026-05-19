package com.trinh.english_center_be.modules.user.dto;

import com.trinh.english_center_be.shared.enums.Roles;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoleRequest {

    @NotNull(message = "Code must not be null")
    private Roles code;

    @Size(max = 500, message = "Description must be at most 500 characters")
    private String description;

    private Long businessRoleId;
}
