package com.trinh.english_center_be.modules.academic.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/** Weekly view of one teacher: every dated session in the range plus how many pairs overlap. */
public record TeacherScheduleResponse(
        String teacherId,
        String userId,
        String teacherFullName,
        List<String> roles,
        List<String> categoryIds,
        List<String> courseCodes,
        int conflictCount,
        List<Occurrence> occurrences
) {
    public record Occurrence(
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            String courseId,
            String courseCode,
            String courseName,
            String room,
            String categoryId,
            boolean conflict
    ) {
    }
}
