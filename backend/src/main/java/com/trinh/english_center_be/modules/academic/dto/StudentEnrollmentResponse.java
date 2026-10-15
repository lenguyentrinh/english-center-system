package com.trinh.english_center_be.modules.academic.dto;

import java.time.LocalDate;

/** One row of GET /users/{id}/enrollments. */
public record StudentEnrollmentResponse(
        String enrollmentId,
        LocalDate enrollDate,
        String enrollmentStatus,
        CourseResponse course
) {
}
