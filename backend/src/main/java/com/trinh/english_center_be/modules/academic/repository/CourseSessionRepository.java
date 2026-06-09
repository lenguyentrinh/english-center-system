package com.trinh.english_center_be.modules.academic.repository;

import com.trinh.english_center_be.modules.academic.entity.CourseSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseSessionRepository extends JpaRepository<CourseSession, Long> {
    List<CourseSession> findByCourseIdOrderBySessionNoAsc(Long courseId);
    Optional<CourseSession> findByIdAndCourseId(Long id, Long courseId);
}
