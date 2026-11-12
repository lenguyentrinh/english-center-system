package com.trinh.english_center_be.modules.user.service;

import com.trinh.english_center_be.modules.academic.entity.Course;
import com.trinh.english_center_be.modules.academic.entity.Enrollment;
import com.trinh.english_center_be.modules.academic.repository.CourseRepository;
import com.trinh.english_center_be.modules.academic.repository.EnrollmentRepository;
import com.trinh.english_center_be.modules.student.entity.Student;
import com.trinh.english_center_be.modules.student.repository.StudentRepository;
import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import com.trinh.english_center_be.modules.teacher.repository.TeacherRepository;
import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.shared.enums.Roles;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Keeps the domain profile that goes with a role in step with it: TEACHER has a {@link Teacher}, STUDENT has a
 * {@link Student}. Adding a role with its own profile later means adding one case to each method here.
 * Nothing is hard-deleted that has history: a student profile is deactivated and its enrollments cancelled.
 */
@Component
@RequiredArgsConstructor
public class RoleProfileService {

    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;

    /** Called after {@code user} receives {@code role}. */
    public void onAssigned(User user, Roles role) {
        switch (role) {
            case TEACHER -> {
                if (teacherRepository.findByUser(user).isEmpty()) {
                    teacherRepository.save(Teacher.builder().user(user).build());
                }
            }
            case STUDENT -> {
                Student student = studentRepository.findByUser(user).orElse(null);
                if (student == null) {
                    studentRepository.save(Student.builder().user(user).build());
                } else if (Boolean.FALSE.equals(student.getActive())) {
                    student.setActive(true);
                    studentRepository.save(student);
                }
            }
            default -> { }
        }
    }

    /** Called after {@code user} lost {@code role}. */
    public void onRemoved(User user, Roles role) {
        switch (role) {
            case TEACHER -> teacherRepository.findByUser(user).ifPresent(teacher -> {
                List<Course> courses = courseRepository.findByTeacher(teacher);
                if (!courses.isEmpty()) {
                    courses.forEach(c -> c.setTeacher(null));
                    courseRepository.saveAll(courses);
                }
                teacherRepository.delete(teacher);
            });
            case STUDENT -> studentRepository.findByUser(user).ifPresent(student -> {
                List<Enrollment> active = enrollmentRepository.findByStudentAndStatus(student, Enrollment.ACTIVE);
                active.forEach(e -> e.setStatus(Enrollment.CANCELLED));
                if (!active.isEmpty()) enrollmentRepository.saveAll(active);
                student.setActive(false);
                studentRepository.save(student);
            });
            default -> { }
        }
    }
}
