package com.trinh.english_center_be.modules.academic.dto;

import com.trinh.english_center_be.shared.enums.UserStatus;
import java.time.LocalDate;

/** One row of GET /courses/{id}/students. Eligibility flags are null when the data to decide is missing. */
public record CourseStudentResponse(
        String enrollmentId,
        String userId,
        String fullName,
        String username,
        String email,
        String phone,
        UserStatus userStatus,
        LocalDate enrollDate,
        String enrollmentStatus,
        Boolean ageEligible,
        Boolean entryLevelEligible,
        Boolean prerequisitesEligible
) {
}
