package com.trinh.english_center_be.modules.academic.service;

import com.trinh.english_center_be.modules.academic.dto.CourseRequest;
import com.trinh.english_center_be.modules.academic.dto.CourseResponse;
import java.util.List;

public interface CourseService {
    List<CourseResponse> findAll();
    CourseResponse findById(String id);
    CourseResponse create(CourseRequest request);
    CourseResponse update(String id, CourseRequest request);
    void softDeleteById(String id);
    CourseResponse assignTeacher(String courseId, String teacherId);
    /** @param force true to accept a teacher schedule conflict (admin confirmed). */
    CourseResponse assignTeacher(String courseId, String teacherId, boolean force);
    List<CourseResponse> findByTeacherUserId(String userId);
    List<CourseResponse> findByTeacherUserIdAndAvailableRoles(String userId, List<com.trinh.english_center_be.shared.enums.Roles> roles);
}