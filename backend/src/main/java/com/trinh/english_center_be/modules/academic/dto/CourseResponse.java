package com.trinh.english_center_be.modules.academic.dto;

import com.trinh.english_center_be.shared.enums.ClassStatus;
import java.time.LocalDate;

public record CourseResponse(
        Long id,
        String code,
        String name,
        LocalDate startDate,
        LocalDate endDate,
        Integer maxStudent,
        ClassStatus status
) {
}