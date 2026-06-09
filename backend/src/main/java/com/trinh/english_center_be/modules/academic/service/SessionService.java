package com.trinh.english_center_be.modules.academic.service;

import com.trinh.english_center_be.modules.academic.dto.SessionRequest;
import com.trinh.english_center_be.modules.academic.dto.SessionResponse;

import java.util.List;

public interface SessionService {
    List<SessionResponse> findByCourseId(Long courseId);
    SessionResponse create(Long courseId, SessionRequest request);
    SessionResponse update(Long courseId, Long sessionId, SessionRequest request);
    void delete(Long courseId, Long sessionId);
}
