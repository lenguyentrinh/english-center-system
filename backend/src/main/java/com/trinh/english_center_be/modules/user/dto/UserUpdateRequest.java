package com.trinh.english_center_be.modules.user.dto;

import com.trinh.english_center_be.shared.enums.UserStatus;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import jakarta.validation.constraints.*;

/**
 * Profile update. Deliberately has no password: passwords change only through
 * {@code POST /auth/change-password} (needs the current one) or the email reset flow.
 * {@code status} and {@code email} are honoured for admins only.
 */
public record UserUpdateRequest(
        @NotBlank(message = MessageConstant.USERNAME_NOT_BLANK)
        @Size(min = Constant.USERNAME_MIN_LENGTH, max = Constant.USERNAME_MAX_LENGTH,
                message = MessageConstant.USERNAME_SIZE_INVALID)
        String username,

        @NotBlank(message = MessageConstant.EMAIL_NOT_BLANK)
        @Email(message = MessageConstant.EMAIL_INVALID)
        String email,

        @Size(min = Constant.FULL_NAME_MIN_LENGTH, max = Constant.FULL_NAME_MAX_LENGTH,
                message = MessageConstant.FULL_NAME_SIZE_INVALID)
        String fullName,

        @Pattern(regexp = Constant.PHONE_PATTERN, message = MessageConstant.PHONE_INVALID)
        String phone,

        UserStatus status
) {
    /** Optional fields are normalised before validation: "0901 234 567" -> "0901234567", "" -> null. */
    public UserUpdateRequest {
        phone = com.trinh.english_center_be.shared.util.TextUtil.normalizePhone(phone);
        fullName = com.trinh.english_center_be.shared.util.TextUtil.blankToNull(fullName);
    }
}
