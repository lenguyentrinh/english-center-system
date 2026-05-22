package com.trinh.english_center_be.modules.user.dto;

import com.trinh.english_center_be.shared.enums.UserStatus;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import jakarta.validation.constraints.*;

public record UserRequest(
        @NotBlank(message = MessageConstant.USERNAME_NOT_BLANK)
        @Size(min = Constant.USERNAME_MIN_LENGTH, max = Constant.USERNAME_MAX_LENGTH,
                message = MessageConstant.USERNAME_SIZE_INVALID)
        String username,

        @NotBlank(message = MessageConstant.PASSWORD_NOT_BLANK)
        @Size(min = Constant.PASSWORD_MIN_LENGTH, max = Constant.PASSWORD_MAX_LENGTH,
                message = MessageConstant.PASSWORD_SIZE_INVALID)
        @Pattern(regexp = Constant.PASSWORD_PATTERN, message = MessageConstant.PASSWORD_LETTER_NUMBER_REQUIRED)
        String password,

        @NotBlank(message = MessageConstant.EMAIL_NOT_BLANK)
        @Email(message = MessageConstant.EMAIL_INVALID)
        String email,

        @Size(min = Constant.FULL_NAME_MIN_LENGTH, max = Constant.FULL_NAME_MAX_LENGTH,
                message = MessageConstant.FULL_NAME_SIZE_INVALID)
        String fullName,

        @Pattern(regexp = Constant.PHONE_PATTERN, message = MessageConstant.PHONE_INVALID)
        String phone,

        @NotNull(message = MessageConstant.USER_STATUS_NOT_NULL)
        UserStatus status
) {
}
