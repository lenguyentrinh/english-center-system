package com.trinh.english_center_be.modules.teacher.mapper;

import com.trinh.english_center_be.modules.teacher.dto.TeacherResponse;
import com.trinh.english_center_be.modules.teacher.entity.Teacher;

import java.math.BigDecimal;

public final class TeacherMapper {
    private TeacherMapper() {}

    public static TeacherResponse toResponse(Teacher t) {
        if (t == null) return null;
        String fullName = t.getUser() != null ? t.getUser().getFullName() : null;
        BigDecimal salary = t.getSalary();
        return new TeacherResponse(t.getId(), fullName, salary);
    }
}
