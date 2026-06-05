package com.trinh.english_center_be.modules.academic.service.impl;

import com.trinh.english_center_be.modules.academic.dto.SessionResponse;
import com.trinh.english_center_be.modules.academic.entity.CourseSession;
import com.trinh.english_center_be.modules.academic.repository.CourseSessionRepository;
import com.trinh.english_center_be.modules.academic.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SessionServiceImpl implements SessionService {

    private final CourseSessionRepository courseSessionRepository;

    @Override
    public List<SessionResponse> findByCourseId(Long courseId) {
        return courseSessionRepository.findByCourseIdOrderBySessionNoAsc(courseId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private SessionResponse toResponse(CourseSession session) {
        return new SessionResponse(
                session.getId(),
                session.getSessionNo(),
                session.getTitle(),
                session.getSessionDate(),
                session.getStartTime(),
                session.getEndTime(),
                session.getTopic()
        );
    }
}
