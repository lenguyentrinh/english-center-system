package com.trinh.english_center_be.modules.academic.dto;

import com.trinh.english_center_be.shared.enums.Roles;

public record CourseSuggestionResponse(
        String id,
        String code,
        String name,
        Roles availableRoleTeacher
) {
}