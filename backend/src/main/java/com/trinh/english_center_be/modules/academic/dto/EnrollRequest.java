package com.trinh.english_center_be.modules.academic.dto;

import jakarta.validation.constraints.NotBlank;

public record EnrollRequest(@NotBlank(message = "User id must not be blank") String userId, Boolean force) {

    public boolean forced() {
        return Boolean.TRUE.equals(force);
    }
}
