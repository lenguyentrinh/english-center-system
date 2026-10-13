package com.trinh.english_center_be.modules.academic.repository;

import com.trinh.english_center_be.modules.academic.entity.Course;
import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import com.trinh.english_center_be.shared.enums.Roles;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CourseRepository extends MongoRepository<Course, String> {

    List<Course> findByAvailableRoleTeacherInAndTeacherIsNull(List<Roles> roles);

    List<Course> findByTeacher(Teacher teacher);

    List<Course> findByTeacherAndAvailableRoleTeacherIn(Teacher teacher, List<Roles> roles);
}
