package com.trinh.english_center_be.modules.user.dto;

import com.trinh.english_center_be.shared.enums.UserStatus;
import jakarta.validation.constraints.*;

public record UserRequest(
        @NotBlank(message = "Username must not be blank")
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
        String username,

        @NotBlank(message = "Password must not be blank")
        @Size(min = 6, max = 255, message = "Password must be between 6 and 255 characters")
        String password,

        @NotBlank(message = "Email must not be blank")
        @Email(message = "Email must be valid")
        String email,

        @Size(max = 100, message = "Full name must be at most 100 characters")
        String fullName,

        @Pattern(regexp = "^[0-9+\\-\\s()]*$", message = "Phone number must be valid")
        @Size(max = 20, message = "Phone must be at most 20 characters")
        String phone,

        @NotNull(message = "Status must not be null")
        UserStatus status
) {
}
