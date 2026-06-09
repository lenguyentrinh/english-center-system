package com.trinh.english_center_be.modules.academic.service.impl;

import com.trinh.english_center_be.modules.academic.dto.SessionRequest;
import com.trinh.english_center_be.modules.academic.dto.SessionResponse;
import com.trinh.english_center_be.modules.academic.entity.Course;
import com.trinh.english_center_be.modules.academic.entity.CourseSession;
import com.trinh.english_center_be.modules.academic.repository.CourseRepository;
import com.trinh.english_center_be.modules.academic.repository.CourseSessionRepository;
import com.trinh.english_center_be.modules.academic.service.SessionService;
import com.trinh.english_center_be.shared.exception.ResourceNotFoundException;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SessionServiceImpl implements SessionService {

    private final CourseSessionRepository courseSessionRepository;
    private final CourseRepository courseRepository;

    @Override
    public List<SessionResponse> findByCourseId(Long courseId) {
        return courseSessionRepository.findByCourseIdOrderBySessionNoAsc(courseId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public SessionResponse create(Long courseId, SessionRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.COURSE, courseId)));

        CourseSession session = CourseSession.builder()
                .course(course)
                .sessionNo(request.sessionNo())
                .title(request.title())
                .sessionDate(request.sessionDate())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .topic(request.topic())
                .build();

        return toResponse(courseSessionRepository.save(session));
    }

    @Override
    @Transactional
    public SessionResponse update(Long courseId, Long sessionId, SessionRequest request) {
        CourseSession session = courseSessionRepository.findByIdAndCourseId(sessionId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.SESSION, sessionId)));

        session.setSessionNo(request.sessionNo());
        session.setTitle(request.title());
        session.setSessionDate(request.sessionDate());
        session.setStartTime(request.startTime());
        session.setEndTime(request.endTime());
        session.setTopic(request.topic());

        return toResponse(courseSessionRepository.save(session));
    }

    @Override
    @Transactional
    public void delete(Long courseId, Long sessionId) {
        CourseSession session = courseSessionRepository.findByIdAndCourseId(sessionId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.SESSION, sessionId)));

        session.setActive(false);
        courseSessionRepository.save(session);
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
