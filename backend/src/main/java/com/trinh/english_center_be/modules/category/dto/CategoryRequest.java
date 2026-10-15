package com.trinh.english_center_be.modules.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank(message = "Name must not be blank")
        @Size(max = 50, message = "Name must be at most 50 characters")
        String name,

        /** Optional; a palette color is picked when absent. */
        @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "Color must be a hex value like #2563eb")
        String color
) {
}
