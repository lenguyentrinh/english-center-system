package com.trinh.english_center_be.modules.teacher.repository;

import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {
}
