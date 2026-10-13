package com.trinh.english_center_be.modules.academic.service;

import com.trinh.english_center_be.modules.academic.dto.SessionRequest;
import com.trinh.english_center_be.modules.academic.dto.SessionResponse;

import java.util.List;

public interface SessionService {
    List<SessionResponse> findByCourseId(String courseId);
    SessionResponse create(String courseId, SessionRequest request);
    SessionResponse update(String courseId, String sessionId, SessionRequest request);
    void delete(String courseId, String sessionId);
}
