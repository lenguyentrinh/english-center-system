package com.trinh.english_center_be.modules.academic.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.trinh.english_center_be.modules.academic.dto.CourseStudentResponse;
import com.trinh.english_center_be.modules.academic.entity.Course;
import com.trinh.english_center_be.modules.academic.entity.Enrollment;
import com.trinh.english_center_be.modules.academic.repository.CourseRepository;
import com.trinh.english_center_be.modules.academic.repository.EnrollmentRepository;
import com.trinh.english_center_be.modules.academic.service.CourseService;
import com.trinh.english_center_be.modules.student.entity.Student;
import com.trinh.english_center_be.modules.student.repository.StudentRepository;
import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import com.trinh.english_center_be.modules.user.Repository.RoleRepository;
import com.trinh.english_center_be.modules.user.Repository.UserRoleRepository;
import com.trinh.english_center_be.modules.user.entity.Role;
import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.modules.user.service.UserService;
import com.trinh.english_center_be.shared.enums.CourseStatus;
import com.trinh.english_center_be.shared.enums.EntryLevel;
import com.trinh.english_center_be.shared.enums.Roles;
import com.trinh.english_center_be.shared.enums.UserStatus;
import com.trinh.english_center_be.shared.exception.BusinessException;
import com.trinh.english_center_be.shared.exception.ForbiddenException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class EnrollmentServiceImplTest {

    @Mock CourseRepository courseRepository;
    @Mock EnrollmentRepository enrollmentRepository;
    @Mock StudentRepository studentRepository;
    @Mock UserService userService;
    @Mock UserRoleRepository userRoleRepository;
    @Mock RoleRepository roleRepository;
    @Mock CourseService courseService;

    EnrollmentServiceImpl service;
    Course course;
    User user;
    Student student;

    @BeforeEach
    void setUp() {
        service = new EnrollmentServiceImpl(courseRepository, enrollmentRepository, studentRepository, userService,
                userRoleRepository, roleRepository, courseService);
        course = Course.builder().id("c1").code("C1").status(CourseStatus.ACTIVE).maxStudent(2).build();
        user = User.builder().id("u1").username("student1").fullName("An Student").status(UserStatus.ACTIVE).build();
        student = Student.builder().id("s1").user(user).build();

        lenient().when(courseRepository.findById("c1")).thenReturn(Optional.of(course));
        lenient().when(userService.findById("u1")).thenReturn(user);
        Role studentRole = Role.builder().id("r-student").code(Roles.STUDENT).build();
        lenient().when(roleRepository.findByCode(Roles.STUDENT)).thenReturn(Optional.of(studentRole));
        lenient().when(userRoleRepository.existsByUserIdAndRoleId("u1", "r-student")).thenReturn(true);
        lenient().when(studentRepository.findByUser(user)).thenReturn(Optional.of(student));
        lenient().when(enrollmentRepository.findByCourseAndStudentAndStatus(course, student, Enrollment.ACTIVE)).thenReturn(Optional.empty());
        lenient().when(enrollmentRepository.countByCourseAndStatus(course, Enrollment.ACTIVE)).thenReturn(0L);
        lenient().when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private void assertRejected(HttpStatus status, String messagePart) {
        assertThatThrownBy(() -> service.enroll("c1", "u1")).isInstanceOfSatisfying(BusinessException.class, e -> {
            assertThat(e.getStatus()).isEqualTo(status);
            assertThat(e.getMessage()).containsIgnoringCase(messagePart);
        });
        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    void enrollsAnActiveStudentAndRecordsEligibility() {
        course.setMinimumAge(16);
        course.setRequiredEntryLevel("B1");
        student.setDateOfBirth(LocalDate.now().minusYears(20));
        student.setEntryLevel(EntryLevel.A2);

        CourseStudentResponse res = service.enroll("c1", "u1");

        assertThat(res.enrollmentStatus()).isEqualTo(Enrollment.ACTIVE);
        assertThat(res.userId()).isEqualTo("u1");
        assertThat(res.ageEligible()).isTrue();
        assertThat(res.entryLevelEligible()).isFalse();
        assertThat(res.prerequisitesEligible()).isTrue();
    }

    @Test
    void eligibilityStaysNullWhenTheStudentDataIsMissing() {
        course.setMinimumAge(16);
        course.setRequiredEntryLevel("B1");

        CourseStudentResponse res = service.enroll("c1", "u1");

        assertThat(res.ageEligible()).isNull();
        assertThat(res.entryLevelEligible()).isNull();
    }

    @Test
    void fullClassIsAConflict() {
        when(enrollmentRepository.countByCourseAndStatus(course, Enrollment.ACTIVE)).thenReturn(2L);
        assertRejected(HttpStatus.CONFLICT, "full");
    }

    @Test
    void duplicateActiveEnrollmentIsAConflict() {
        when(enrollmentRepository.findByCourseAndStudentAndStatus(course, student, Enrollment.ACTIVE)).thenReturn(Optional.of(new Enrollment()));
        assertRejected(HttpStatus.CONFLICT, "already");
    }

    @Test
    void closedCourseIsRejected() {
        course.setStatus(CourseStatus.CLOSE);
        assertRejected(HttpStatus.CONFLICT, "closed");
    }

    @Test
    void lockedUserAndNonStudentAreRejected() {
        user.setStatus(UserStatus.LOCKED);
        assertRejected(HttpStatus.BAD_REQUEST, "not active");

        user.setStatus(UserStatus.ACTIVE);
        when(userRoleRepository.existsByUserIdAndRoleId("u1", "r-student")).thenReturn(false);
        assertRejected(HttpStatus.BAD_REQUEST, "not a student");
    }

    @Test
    void studentProfileIsCreatedOnDemandForLegacyAccounts() {
        when(studentRepository.findByUser(user)).thenReturn(Optional.empty());
        when(studentRepository.save(any(Student.class))).thenAnswer(inv -> inv.getArgument(0));
        when(enrollmentRepository.findByCourseAndStudentAndStatus(any(), any(), org.mockito.ArgumentMatchers.eq(Enrollment.ACTIVE))).thenReturn(Optional.empty());

        service.enroll("c1", "u1");

        verify(studentRepository).save(any(Student.class));
    }

    @Test
    void cancelKeepsTheRowAndMarksItCancelled() {
        Enrollment active = Enrollment.builder().id("e1").status(Enrollment.ACTIVE).build();
        when(enrollmentRepository.findByCourseAndStudentAndStatus(course, student, Enrollment.ACTIVE)).thenReturn(Optional.of(active));

        service.cancel("c1", "u1");

        assertThat(active.getStatus()).isEqualTo(Enrollment.CANCELLED);
        verify(enrollmentRepository).save(active);
        verify(enrollmentRepository, never()).delete(any());
    }

    @Test
    void onlyTheOwningTeacherOrAnAdminMayListStudents() {
        User owner = User.builder().id("teacher-user").build();
        course.setTeacher(Teacher.builder().id("t1").user(owner).build());
        when(enrollmentRepository.findByCourseAndStatus(course, Enrollment.ACTIVE)).thenReturn(List.of());

        assertThat(service.listStudents("c1", null, "teacher-user", false)).isEmpty();
        assertThat(service.listStudents("c1", null, "someone", true)).isEmpty();
        assertThatThrownBy(() -> service.listStudents("c1", null, "other-teacher", false)).isInstanceOf(ForbiddenException.class);
    }

    @Test
    void unknownStatusFilterIsABadRequest() {
        assertThatThrownBy(() -> service.listStudents("c1", "WHATEVER", "x", true)).isInstanceOf(BusinessException.class);
    }
}
