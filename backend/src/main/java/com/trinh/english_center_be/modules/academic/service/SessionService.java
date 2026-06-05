package com.trinh.english_center_be.modules.academic.service;

import com.trinh.english_center_be.modules.academic.dto.SessionResponse;

import java.util.List;

public interface SessionService {
    List<SessionResponse> findByCourseId(Long courseId);
}
