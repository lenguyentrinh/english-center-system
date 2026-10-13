package com.trinh.english_center_be.modules.academic.dto;

import com.trinh.english_center_be.shared.enums.CourseStatus;
import com.trinh.english_center_be.shared.enums.Roles;

import java.time.LocalDate;

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
        Roles availableRoleTeacher
) {
}