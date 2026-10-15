package com.trinh.english_center_be.modules.academic.repository;

import com.trinh.english_center_be.modules.academic.entity.Course;
import com.trinh.english_center_be.modules.academic.entity.Enrollment;
import com.trinh.english_center_be.modules.student.entity.Student;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EnrollmentRepository extends MongoRepository<Enrollment, String> {

    long countByCourseAndStatus(Course course, String status);

    List<Enrollment> findByCourse(Course course);

    List<Enrollment> findByCourseAndStatus(Course course, String status);

    Optional<Enrollment> findByCourseAndStudentAndStatus(Course course, Student student, String status);

    List<Enrollment> findByStudent(Student student);

    List<Enrollment> findByStudentAndStatus(Student student, String status);
}
