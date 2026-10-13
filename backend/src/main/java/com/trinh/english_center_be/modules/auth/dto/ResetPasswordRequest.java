package com.trinh.english_center_be.modules.auth.dto;

import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = MessageConstant.EMAIL_NOT_BLANK)
        @Email(message = MessageConstant.EMAIL_INVALID)
        @Size(max = 255)
        String email,

        @NotBlank
        @Pattern(regexp = "^\\d{6}$", message = "Code must be 6 digits")
        String otp,

        @NotBlank(message = MessageConstant.PASSWORD_NOT_BLANK)
        @Size(min = Constant.PASSWORD_MIN_LENGTH, max = Constant.PASSWORD_MAX_LENGTH,
                message = MessageConstant.PASSWORD_SIZE_INVALID)
        @Pattern(regexp = Constant.PASSWORD_PATTERN, message = MessageConstant.PASSWORD_LETTER_NUMBER_REQUIRED)
        String newPassword
) {}
