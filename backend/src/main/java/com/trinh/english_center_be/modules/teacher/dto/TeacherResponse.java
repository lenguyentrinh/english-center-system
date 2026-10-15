package com.trinh.english_center_be.modules.teacher.dto;

import java.math.BigDecimal;
import java.util.List;

/** {@code salary} is only filled for admins; {@code roles} are the user's role codes, {@code categoryIds} the specialties. */
public record TeacherResponse(
        String id,
        String userId,
        String fullName,
        BigDecimal salary,
        List<String> roles,
        List<String> categoryIds
) {
    public TeacherResponse withoutSalary() {
        return new TeacherResponse(id, userId, fullName, null, roles, categoryIds);
    }
}
