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
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SessionServiceImpl implements SessionService {

    private final CourseSessionRepository courseSessionRepository;
    private final CourseRepository courseRepository;

    @Override
    public List<SessionResponse> findByCourseId(String courseId) {
        return courseRepository.findById(courseId)
                .map(course -> courseSessionRepository.findByCourseOrderBySessionNoAsc(course).stream()
                        .map(this::toResponse)
                        .toList())
                .orElse(List.of());
    }

    @Override
    public SessionResponse create(String courseId, SessionRequest request) {
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
    public SessionResponse update(String courseId, String sessionId, SessionRequest request) {
        CourseSession session = findSessionOfCourse(courseId, sessionId);

        session.setSessionNo(request.sessionNo());
        session.setTitle(request.title());
        session.setSessionDate(request.sessionDate());
        session.setStartTime(request.startTime());
        session.setEndTime(request.endTime());
        session.setTopic(request.topic());

        return toResponse(courseSessionRepository.save(session));
    }

    @Override
    public void delete(String courseId, String sessionId) {
        CourseSession session = findSessionOfCourse(courseId, sessionId);

        session.setActive(false);
        courseSessionRepository.save(session);
    }

    /**
     * Session -> Course is a DBRef, so the course is loaded first and the session is matched
     * against that document. Both "course missing" and "session not in course" report the session as not found.
     */
    private CourseSession findSessionOfCourse(String courseId, String sessionId) {
        return courseRepository.findById(courseId)
                .flatMap(course -> courseSessionRepository.findByIdAndCourse(sessionId, course))
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.SESSION, sessionId)));
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
