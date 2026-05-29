package com.trinh.english_center_be.modules.academic.service;

import com.trinh.english_center_be.modules.academic.dto.CourseRequest;
import com.trinh.english_center_be.modules.academic.dto.CourseResponse;
import java.util.List;

public interface CourseService {
    List<CourseResponse> findAll();
    CourseResponse findById(Long id);
    CourseResponse create(CourseRequest request);
    CourseResponse update(Long id, CourseRequest request);
    void softDeleteById(Long id);
    CourseResponse assignTeacher(Long courseId, Long teacherId);
    List<CourseResponse> findByTeacherUserId(Long userId);
    List<CourseResponse> findByTeacherUserIdAndAvailableRoles(Long userId, List<com.trinh.english_center_be.shared.enums.Roles> roles);
}