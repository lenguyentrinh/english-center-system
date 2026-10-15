package com.trinh.english_center_be.modules.academic.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.trinh.english_center_be.modules.academic.dto.CourseRequest;
import com.trinh.english_center_be.modules.academic.dto.CourseResponse;
import com.trinh.english_center_be.modules.academic.entity.Course;
import com.trinh.english_center_be.modules.academic.repository.CourseRepository;
import com.trinh.english_center_be.modules.academic.repository.EnrollmentRepository;
import com.trinh.english_center_be.modules.category.repository.CategoryRepository;
import com.trinh.english_center_be.modules.category.service.CategoryService;
import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import com.trinh.english_center_be.modules.teacher.repository.TeacherRepository;
import com.trinh.english_center_be.modules.user.Repository.UserRepository;
import com.trinh.english_center_be.shared.enums.CourseStatus;
import com.trinh.english_center_be.shared.exception.BusinessException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class CourseServiceImplTest {

    @Mock CourseRepository courseRepository;
    @Mock TeacherRepository teacherRepository;
    @Mock UserRepository userRepository;
    @Mock CategoryService categoryService;
    @Mock CategoryRepository categoryRepository;
    @Mock EnrollmentRepository enrollmentRepository;

    CourseServiceImpl service;
    Teacher teacher;

    @BeforeEach
    void setUp() {
        service = new CourseServiceImpl(courseRepository, teacherRepository, userRepository, categoryService,
                categoryRepository, enrollmentRepository);
        teacher = Teacher.builder().id("t1").categoryIds(new ArrayList<>(List.of("ielts"))).build();
        lenient().when(teacherRepository.findById("t1")).thenReturn(Optional.of(teacher));
        lenient().when(courseRepository.save(any(Course.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private CourseRequest request(String teacherId, String categoryId, List<Integer> days, String start, String end, Boolean force) {
        LocalDate from = LocalDate.now().plusDays(1);
        return new CourseRequest("IELTS70", "IELTS 7.0", from, from.plusMonths(3), 15, CourseStatus.OPEN, 16, "B1", false,
                teacherId, null, categoryId, "P.201", days, start == null ? null : LocalTime.parse(start),
                end == null ? null : LocalTime.parse(end), force);
    }

    private Course existing() {
        LocalDate from = LocalDate.now();
        return Course.builder().id("c-old").code("OLD").status(CourseStatus.ACTIVE).teacher(teacher)
                .startDate(from).endDate(from.plusMonths(6)).daysOfWeek(List.of(1, 3))
                .startTime(LocalTime.of(18, 30)).endTime(LocalTime.of(20, 30)).build();
    }

    @Test
    void teacherScheduleConflictIsA409NamingTheCourse() {
        when(courseRepository.findByTeacher(teacher)).thenReturn(List.of(existing()));

        assertThatThrownBy(() -> service.create(request("t1", null, List.of(1), "19:00", "21:00", null)))
                .isInstanceOfSatisfying(BusinessException.class, e -> {
                    assertThat(e.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(e.getMessage()).contains("OLD");
                });
        verify(courseRepository, never()).save(any());
    }

    @Test
    void forceSavesDespiteTheConflict() {
        lenient().when(courseRepository.findByTeacher(teacher)).thenReturn(List.of(existing()));

        CourseResponse res = service.create(request("t1", null, List.of(1), "19:00", "21:00", true));

        assertThat(res.teacherId()).isEqualTo("t1");
        verify(courseRepository).save(any(Course.class));
    }

    @Test
    void nonOverlappingSlotIsAccepted() {
        when(courseRepository.findByTeacher(teacher)).thenReturn(List.of(existing()));

        service.create(request("t1", null, List.of(1), "20:30", "22:00", null));

        verify(courseRepository).save(any(Course.class));
    }

    @Test
    void courseWithACategoryNeedsATeacherWhoHasIt() {
        assertThatThrownBy(() -> service.create(request("t1", "toeic", null, null, null, null)))
                .isInstanceOfSatisfying(BusinessException.class, e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
        verify(courseRepository, never()).save(any());
    }

    @Test
    void matchingCategoryQualifiesAndWithoutCategoryAnyTeacherDoes() {
        service.create(request("t1", "ielts", null, null, null, null));
        service.create(request("t1", null, null, null, null, null));

        verify(courseRepository, org.mockito.Mockito.times(2)).save(any(Course.class));
    }

    @Test
    void unknownCategoryIsRejectedByTheCategoryService() {
        org.mockito.Mockito.doThrow(new BusinessException("Unknown category", HttpStatus.NOT_FOUND))
                .when(categoryService).requireActive("ghost");

        assertThatThrownBy(() -> service.create(request(null, "ghost", null, null, null, null))).isInstanceOf(BusinessException.class);
    }

    @Test
    void newCourseCannotStartInThePast() {
        CourseRequest past = new CourseRequest("X1", "X", LocalDate.now().minusDays(1), LocalDate.now().plusDays(5), 5,
                CourseStatus.OPEN, 0, "A1", false, null, null, null, null, null, null, null, null);

        assertThatThrownBy(() -> service.create(past)).isInstanceOf(BusinessException.class);
    }

    @Test
    void runningCourseCanStillBeEditedAndEndMustNotPrecedeStart() {
        Course running = existing();
        when(courseRepository.findById("c-old")).thenReturn(Optional.of(running));
        LocalDate startedLastMonth = LocalDate.now().minusMonths(1);

        CourseRequest ok = new CourseRequest("OLD", "Renamed", startedLastMonth, startedLastMonth.plusMonths(4), 15,
                CourseStatus.ACTIVE, 16, "B1", false, null, null, null, null, null, null, null, null);
        assertThat(service.update("c-old", ok).name()).isEqualTo("Renamed");

        CourseRequest inverted = new CourseRequest("OLD", "Bad", startedLastMonth, startedLastMonth.minusDays(2), 15,
                CourseStatus.ACTIVE, 16, "B1", false, null, null, null, null, null, null, null, null);
        assertThatThrownBy(() -> service.update("c-old", inverted)).isInstanceOf(BusinessException.class);
    }

    @Test
    void assignTeacherChecksConflictsUnlessForced() {
        Course target = Course.builder().id("c-new").code("NEW").status(CourseStatus.OPEN)
                .startDate(LocalDate.now()).endDate(LocalDate.now().plusMonths(2)).daysOfWeek(List.of(1))
                .startTime(LocalTime.of(19, 0)).endTime(LocalTime.of(21, 0)).build();
        when(courseRepository.findById("c-new")).thenReturn(Optional.of(target));
        when(courseRepository.findByTeacher(teacher)).thenReturn(List.of(existing()));

        assertThatThrownBy(() -> service.assignTeacher("c-new", "t1")).isInstanceOf(BusinessException.class);
        assertThat(service.assignTeacher("c-new", "t1", true).teacherId()).isEqualTo("t1");
    }

    @Test
    void softDeletedCoursesAreHiddenFromReads() {
        Course gone = Course.builder().id("c9").active(false).build();
        when(courseRepository.findAll()).thenReturn(List.of(gone, existing()));
        when(courseRepository.findById("c9")).thenReturn(Optional.of(gone));

        assertThat(service.findAll()).hasSize(1);
        assertThatThrownBy(() -> service.findById("c9")).isInstanceOf(com.trinh.english_center_be.shared.exception.ResourceNotFoundException.class);
    }
}
