package com.trinh.english_center_be.modules.teacher.mapper;

import com.trinh.english_center_be.modules.teacher.dto.TeacherResponse;
import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import java.util.List;

public final class TeacherMapper {
    private TeacherMapper() {}

    public static TeacherResponse toResponse(Teacher t) {
        return toResponse(t, List.of());
    }

    public static TeacherResponse toResponse(Teacher t, List<String> roles) {
        if (t == null) return null;
        String fullName = t.getUser() != null ? t.getUser().getFullName() : null;
        String userId = t.getUser() != null ? t.getUser().getId() : null;
        List<String> categories = t.getCategoryIds() == null ? List.of() : List.copyOf(t.getCategoryIds());
        return new TeacherResponse(t.getId(), userId, fullName, t.getSalary(), roles, categories);
    }
}
