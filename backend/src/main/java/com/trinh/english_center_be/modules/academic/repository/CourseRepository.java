package com.trinh.english_center_be.modules.academic.repository;

import com.trinh.english_center_be.modules.academic.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
}