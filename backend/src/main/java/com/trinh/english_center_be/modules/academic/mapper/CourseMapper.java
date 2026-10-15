package com.trinh.english_center_be.modules.academic.mapper;

import com.trinh.english_center_be.modules.academic.dto.CourseResponse;
import com.trinh.english_center_be.modules.academic.dto.CourseSuggestionResponse;
import com.trinh.english_center_be.modules.academic.entity.Course;
import com.trinh.english_center_be.modules.category.entity.Category;

public final class CourseMapper {
    private CourseMapper() {}

    public static CourseSuggestionResponse toSuggestion(Course c) {
        if (c == null) return null;
        return new CourseSuggestionResponse(c.getId(), c.getCode(), c.getName(), c.getAvailableRoleTeacher());
    }

    public static CourseResponse toResponse(Course course) {
        return toResponse(course, null, null);
    }

    /** @param category the course's category when resolved (nullable); @param enrolled active enrollments (nullable). */
    public static CourseResponse toResponse(Course course, Category category, Long enrolled) {
        if (course == null) return null;
        return new CourseResponse(
                course.getId(),
                course.getCode(),
                course.getName(),
                course.getStartDate(),
                course.getEndDate(),
                course.getMaxStudent(),
                course.getStatus(),
                course.getMinimumAge(),
                course.getRequiredEntryLevel(),
                course.getPrerequisitesRequired(),
                course.getTeacher() != null ? course.getTeacher().getId() : null,
                course.getTeacher() != null && course.getTeacher().getUser() != null ? course.getTeacher().getUser().getFullName() : null,
                course.getAvailableRoleTeacher(),
                course.getCategoryId(),
                category != null ? category.getName() : null,
                category != null ? category.getColor() : null,
                course.getRoom(),
                course.getDaysOfWeek(),
                course.getStartTime(),
                course.getEndTime(),
                enrolled
        );
    }
}
