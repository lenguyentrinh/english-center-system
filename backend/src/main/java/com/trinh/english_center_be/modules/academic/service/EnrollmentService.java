package com.trinh.english_center_be.modules.academic.service;

import com.trinh.english_center_be.modules.academic.dto.CourseStudentResponse;
import com.trinh.english_center_be.modules.academic.dto.StudentEnrollmentResponse;
import java.util.List;

public interface EnrollmentService {

    /**
     * @param status ACTIVE (default when null), CANCELLED or ALL
     * @param admin  admins see any course; otherwise the caller must be the course's teacher (403 otherwise)
     */
    List<CourseStudentResponse> listStudents(String courseId, String status, String actingUserId, boolean admin);

    CourseStudentResponse enroll(String courseId, String userId);

    /** {@code force} skips only the student schedule-conflict check. */
    CourseStudentResponse enroll(String courseId, String userId, boolean force);

    /**
     * A student registering themselves: same rules as {@link #enroll(String, String)} (schedule clashes are never
     * forced), but the course must be OPEN (admins can still add students to an ACTIVE course).
     */
    CourseStudentResponse enrollSelf(String courseId, String userId);

    /** Marks the active enrollment CANCELLED (history is kept). */
    void cancel(String courseId, String userId);

    List<StudentEnrollmentResponse> listForUser(String userId);
}
