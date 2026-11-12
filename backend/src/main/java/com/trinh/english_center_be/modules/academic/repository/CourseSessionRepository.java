package com.trinh.english_center_be.modules.academic.repository;

import com.trinh.english_center_be.modules.academic.entity.Course;
import com.trinh.english_center_be.modules.academic.entity.CourseSession;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseSessionRepository extends JpaRepository<CourseSession, String> {

    List<CourseSession> findByCourseOrderBySessionNoAsc(Course course);

    Optional<CourseSession> findByIdAndCourse(String id, Course course);
}
