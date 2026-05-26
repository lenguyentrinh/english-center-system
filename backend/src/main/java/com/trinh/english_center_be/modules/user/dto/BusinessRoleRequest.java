package com.trinh.english_center_be.modules.user.dto;

import com.trinh.english_center_be.shared.enums.BusinessRoles;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BusinessRoleRequest (

        @NotNull(message = MessageConstant.CODE_NOT_NULL)
         BusinessRoles code,

        @Size(max = Constant.DESCRIPTION_MAX_LENGTH, message = MessageConstant.DESCRIPTION_MAX_LENGTH)
        String description,

        Boolean active
){}
