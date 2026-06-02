package com.trinh.english_center_be.modules.academic.repository;

import com.trinh.english_center_be.modules.academic.entity.Course;
import com.trinh.english_center_be.shared.enums.Roles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
	List<Course> findByAvailableRoleTeacherInAndTeacherIsNull(List<Roles> roles);

	@Query("select c from Course c join c.teacher t where t.user.id = :userId")
	List<Course> findByTeacherUserId(@Param("userId") Long userId);

	@Query("select c from Course c join c.teacher t where t.user.id = :userId and c.availableRoleTeacher in :roles")
	List<Course> findByTeacherUserIdAndAvailableRoleTeacherIn(@Param("userId") Long userId, @Param("roles") List<Roles> roles);
}