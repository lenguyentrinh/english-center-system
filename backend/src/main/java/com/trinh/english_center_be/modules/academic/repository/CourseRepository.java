package com.trinh.english_center_be.modules.academic.repository;

import com.trinh.english_center_be.modules.academic.entity.Course;
import com.trinh.english_center_be.shared.enums.Roles;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
	List<Course> findByAvailableRoleTeacherInAndTeacherIsNull(List<Roles> roles);
}