package com.trinh.english_center_be.modules.academic.service;

import com.trinh.english_center_be.modules.academic.dto.TeacherScheduleResponse;
import java.time.LocalDate;
import java.util.List;

public interface CourseScheduleService {

    /**
     * Teachers with their dated sessions in [from, to] (defaults: the current Monday-Sunday week, max 62 days).
     * Admins may pass {@code teacherId} or omit it for every teacher; other callers only ever get their own row.
     */
    List<TeacherScheduleResponse> schedule(String teacherId, LocalDate from, LocalDate to, String actingUserId, boolean admin);
}
