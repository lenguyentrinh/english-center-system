package com.trinh.english_center_be.modules.academic.service.impl;

import com.trinh.english_center_be.modules.academic.dto.CourseResponse;
import com.trinh.english_center_be.modules.academic.dto.CourseStudentResponse;
import com.trinh.english_center_be.modules.academic.dto.StudentEnrollmentResponse;
import com.trinh.english_center_be.modules.academic.entity.Course;
import com.trinh.english_center_be.modules.academic.entity.Enrollment;
import com.trinh.english_center_be.modules.academic.repository.CourseRepository;
import com.trinh.english_center_be.modules.academic.repository.EnrollmentRepository;
import com.trinh.english_center_be.modules.academic.service.CourseService;
import com.trinh.english_center_be.modules.academic.service.EnrollmentService;
import com.trinh.english_center_be.modules.student.entity.Student;
import com.trinh.english_center_be.modules.student.repository.StudentRepository;
import com.trinh.english_center_be.modules.user.Repository.RoleRepository;
import com.trinh.english_center_be.modules.user.Repository.UserRoleRepository;
import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.modules.user.service.UserService;
import com.trinh.english_center_be.shared.enums.CourseStatus;
import com.trinh.english_center_be.shared.enums.EntryLevel;
import com.trinh.english_center_be.shared.enums.Roles;
import com.trinh.english_center_be.shared.enums.UserStatus;
import com.trinh.english_center_be.shared.exception.BusinessException;
import com.trinh.english_center_be.shared.exception.ForbiddenException;
import com.trinh.english_center_be.shared.exception.ResourceNotFoundException;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final UserService userService;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final CourseService courseService;

    @Override
    public List<CourseStudentResponse> listStudents(String courseId, String status, String actingUserId, boolean admin) {
        Course course = requireLive(courseId);
        if (!admin) {
            String owner = course.getTeacher() != null && course.getTeacher().getUser() != null
                    ? course.getTeacher().getUser().getId() : null;
            if (owner == null || !owner.equals(actingUserId)) {
                throw new ForbiddenException("Only the course teacher or an admin can list its students");
            }
        }

        String wanted = status == null || status.isBlank() ? Enrollment.ACTIVE : status.trim().toUpperCase();
        List<Enrollment> rows = switch (wanted) {
            case "ALL" -> enrollmentRepository.findByCourse(course);
            case Enrollment.ACTIVE, Enrollment.CANCELLED -> enrollmentRepository.findByCourseAndStatus(course, wanted);
            default -> throw new BusinessException("status must be ACTIVE, CANCELLED or ALL", HttpStatus.BAD_REQUEST);
        };

        List<CourseStudentResponse> out = new ArrayList<>();
        for (Enrollment e : rows) out.add(toStudentRow(e, course));
        out.sort((a, b) -> String.valueOf(a.fullName()).compareToIgnoreCase(String.valueOf(b.fullName())));
        return out;
    }

    @Override
    public CourseStudentResponse enroll(String courseId, String userId) {
        return enroll(courseId, userId, false);
    }

    @Override
    public CourseStudentResponse enroll(String courseId, String userId, boolean force) {
        Course course = requireLive(courseId);
        if (course.getStatus() == CourseStatus.CLOSE) {
            throw new BusinessException("Course is closed for enrollment", HttpStatus.CONFLICT);
        }

        User user = userService.findById(userId);
        if (Boolean.FALSE.equals(user.getActive()) || user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException("User account is not active", HttpStatus.BAD_REQUEST);
        }
        if (!hasStudentRole(userId)) {
            throw new BusinessException("User is not a student", HttpStatus.BAD_REQUEST);
        }

        Student student = findOrCreateStudent(user);
        if (enrollmentRepository.findByCourseAndStudentAndStatus(course, student, Enrollment.ACTIVE).isPresent()) {
            throw new BusinessException("Student is already enrolled in this course", HttpStatus.CONFLICT);
        }
        int max = course.getMaxStudent() == null ? Integer.MAX_VALUE : course.getMaxStudent();
        if (enrollmentRepository.countByCourseAndStatus(course, Enrollment.ACTIVE) >= max) {
            throw new BusinessException("Class is full", HttpStatus.CONFLICT);
        }

        if (!force) {
            List<Course> mine = enrollmentRepository.findByStudent(student).stream()
                    .filter(e -> Enrollment.ACTIVE.equals(e.getStatus()) && e.getCourse() != null)
                    .map(Enrollment::getCourse)
                    .toList();
            List<Course> clashes = com.trinh.english_center_be.modules.academic.service.ScheduleRules.conflicts(course, mine);
            if (!clashes.isEmpty()) {
                String codes = clashes.stream().map(Course::getCode).collect(java.util.stream.Collectors.joining(", "));
                throw new BusinessException("Student has a schedule conflict with: " + codes, HttpStatus.CONFLICT);
            }
        }

        Enrollment enrollment = Enrollment.builder()
                .course(course)
                .student(student)
                .enrollDate(LocalDate.now())
                .status(Enrollment.ACTIVE)
                .ageEligible(ageEligible(course, student))
                .entryLevelEligible(entryLevelEligible(course, student))
                .prerequisitesEligible(prerequisitesEligible(course, student))
                .eligibilityCheckDate(LocalDateTime.now())
                .build();
        return toStudentRow(enrollmentRepository.save(enrollment), course, student, user);
    }

    @Override
    public void cancel(String courseId, String userId) {
        Course course = requireLive(courseId);
        User user = userService.findById(userId);
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Student is not enrolled in this course"));
        Enrollment enrollment = enrollmentRepository.findByCourseAndStudentAndStatus(course, student, Enrollment.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Student is not enrolled in this course"));
        enrollment.setStatus(Enrollment.CANCELLED);
        enrollmentRepository.save(enrollment);
    }

    @Override
    public List<StudentEnrollmentResponse> listForUser(String userId) {
        User user = userService.findById(userId);
        Student student = studentRepository.findByUser(user).orElse(null);
        if (student == null) return List.of();

        List<StudentEnrollmentResponse> out = new ArrayList<>();
        for (Enrollment e : enrollmentRepository.findByStudent(student)) {
            CourseResponse course;
            try {
                course = courseService.findById(e.getCourse().getId());
            } catch (ResourceNotFoundException gone) {
                continue; // the course was soft-deleted
            }
            out.add(new StudentEnrollmentResponse(e.getId(), e.getEnrollDate(), e.getStatus(), course));
        }
        return out;
    }

    // ---- helpers ---------------------------------------------------------------------------------------------

    private Course requireLive(String id) {
        return courseRepository.findById(id)
                .filter(c -> !Boolean.FALSE.equals(c.getActive()))
                .orElseThrow(() -> new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.COURSE, id)));
    }

    private boolean hasStudentRole(String userId) {
        return roleRepository.findByCode(Roles.STUDENT)
                .map(role -> userRoleRepository.existsByUserIdAndRoleId(userId, role.getId()))
                .orElse(false);
    }

    /** Legacy students may have the role but no Student profile yet; an inactive profile is revived. */
    private Student findOrCreateStudent(User user) {
        Student student = studentRepository.findByUser(user).orElse(null);
        if (student == null) return studentRepository.save(Student.builder().user(user).build());
        if (Boolean.FALSE.equals(student.getActive())) {
            student.setActive(true);
            return studentRepository.save(student);
        }
        return student;
    }

    private CourseStudentResponse toStudentRow(Enrollment e, Course course) {
        Student student = e.getStudent();
        User user = student == null ? null : student.getUser();
        return toStudentRow(e, course, student, user);
    }

    private CourseStudentResponse toStudentRow(Enrollment e, Course course, Student student, User user) {
        return new CourseStudentResponse(
                e.getId(),
                user == null ? null : user.getId(),
                user == null ? null : user.getFullName(),
                user == null ? null : user.getUsername(),
                user == null ? null : user.getEmail(),
                user == null ? null : user.getPhone(),
                user == null ? null : user.getStatus(),
                e.getEnrollDate(),
                e.getStatus(),
                e.getAgeEligible(),
                e.getEntryLevelEligible(),
                e.getPrerequisitesEligible());
    }

    /** Null (unknown) unless both the course minimum age and the student's birth date are known. */
    static Boolean ageEligible(Course course, Student student) {
        if (course.getMinimumAge() == null || student.getDateOfBirth() == null) return null;
        return Period.between(student.getDateOfBirth(), LocalDate.now()).getYears() >= course.getMinimumAge();
    }

    static Boolean entryLevelEligible(Course course, Student student) {
        if (course.getRequiredEntryLevel() == null || student.getEntryLevel() == null) return null;
        try {
            EntryLevel required = EntryLevel.valueOf(course.getRequiredEntryLevel().trim().toUpperCase());
            return student.getEntryLevel().ordinal() >= required.ordinal();
        } catch (IllegalArgumentException unknownLevel) {
            return null;
        }
    }

    static Boolean prerequisitesEligible(Course course, Student student) {
        if (!Boolean.TRUE.equals(course.getPrerequisitesRequired())) return true;
        return student.getPrerequisitesCompleted();
    }
}
