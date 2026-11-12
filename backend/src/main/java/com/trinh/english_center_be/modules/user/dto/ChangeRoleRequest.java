package com.trinh.english_center_be.modules.user.dto;

import com.trinh.english_center_be.shared.enums.Roles;
import com.trinh.english_center_be.shared.util.MessageConstant;
import jakarta.validation.constraints.NotNull;

public record ChangeRoleRequest(
        @NotNull(message = MessageConstant.CODE_NOT_NULL)
        Roles role
) {}
