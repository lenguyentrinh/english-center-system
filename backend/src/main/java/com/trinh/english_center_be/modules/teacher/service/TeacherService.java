package com.trinh.english_center_be.modules.teacher.service;

import com.trinh.english_center_be.modules.teacher.dto.TeacherResponse;
import com.trinh.english_center_be.modules.teacher.dto.TeacherUpsertRequest;
import java.util.List;
import java.util.Optional;

public interface TeacherService {
    List<TeacherResponse> findTeachers(String role);

    Optional<TeacherResponse> findById(Long id);

    Optional<TeacherResponse> findByUserId(Long userId);

    TeacherResponse upsertByUserId(Long userId, TeacherUpsertRequest request);
}
