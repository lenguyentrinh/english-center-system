package com.trinh.english_center_be.modules.academic.dto;

import com.trinh.english_center_be.shared.enums.CourseStatus;
import com.trinh.english_center_be.shared.enums.Roles;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record CourseResponse(
        String id,
        String code,
        String name,
        LocalDate startDate,
        LocalDate endDate,
        Integer maxStudent,
        CourseStatus status,
        Integer minimumAge,
        String requiredEntryLevel,
        Boolean prerequisitesRequired,
        String teacherId,
        String teacherFullName,
        Roles availableRoleTeacher,
        String categoryId,
        String categoryName,
        String categoryColor,
        String room,
        List<Integer> daysOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        /** Active enrollments (null where the count was not computed). */
        Long enrolledCount
) {
}
