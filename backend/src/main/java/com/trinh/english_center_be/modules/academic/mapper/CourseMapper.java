package com.trinh.english_center_be.modules.academic.mapper;

import com.trinh.english_center_be.modules.academic.dto.CourseSuggestionResponse;
import com.trinh.english_center_be.modules.academic.entity.Course;

public final class CourseMapper {
    private CourseMapper() {}

    public static CourseSuggestionResponse toSuggestion(Course c) {
        if (c == null) return null;
        return new CourseSuggestionResponse(c.getId(), c.getCode(), c.getName(), c.getAvailableRoleTeacher());
    }
}
