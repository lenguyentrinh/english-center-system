package com.trinh.english_center_be.modules.teacher.repository;

import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {

	@Query("SELECT t FROM Teacher t JOIN FETCH t.user")
	List<Teacher> findAllWithUser();

	@Query("SELECT t FROM Teacher t JOIN FETCH t.user u WHERE u.id = :userId")
	Optional<Teacher> findByUserIdWithUser(@Param("userId") Long userId);

	@Query("SELECT t FROM Teacher t JOIN FETCH t.user WHERE t.id = :id")
	Optional<Teacher> findByIdWithUser(@Param("id") Long id);

	@Query("SELECT t FROM Teacher t JOIN FETCH t.user u WHERE u.id IN :userIds")
	List<Teacher> findByUserIdInWithUser(@Param("userIds") List<Long> userIds);

	Optional<Teacher> findByUserId(Long userId);
}
