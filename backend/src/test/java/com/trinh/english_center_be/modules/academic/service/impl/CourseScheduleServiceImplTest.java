package com.trinh.english_center_be.modules.academic.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.trinh.english_center_be.modules.academic.dto.TeacherScheduleResponse;
import com.trinh.english_center_be.modules.academic.entity.Course;
import com.trinh.english_center_be.modules.academic.repository.CourseRepository;
import com.trinh.english_center_be.modules.teacher.dto.TeacherResponse;
import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import com.trinh.english_center_be.modules.teacher.service.TeacherService;
import com.trinh.english_center_be.shared.enums.CourseStatus;
import com.trinh.english_center_be.shared.exception.BusinessException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CourseScheduleServiceImplTest {

    // 2026-10-12 is a Monday
    static final LocalDate MON = LocalDate.parse("2026-10-12");
    static final LocalDate SUN = LocalDate.parse("2026-10-18");

    @Mock CourseRepository courseRepository;
    @Mock TeacherService teacherService;

    CourseScheduleServiceImpl service;
    TeacherResponse ha = new TeacherResponse("t1", "u1", "Nguyen Ha", null, List.of("TEACHER"), List.of("ielts"));
    TeacherResponse minh = new TeacherResponse("t2", "u2", "Tran Minh", null, List.of("TEACHER"), List.of());

    @BeforeEach
    void setUp() {
        service = new CourseScheduleServiceImpl(courseRepository, teacherService);
        org.mockito.Mockito.lenient().when(teacherService.findTeachers(null)).thenReturn(List.of(ha, minh));
    }

    private Course course(String code, String teacherId, List<Integer> days, String start, String end) {
        return Course.builder().id(code).code(code).name(code).status(CourseStatus.ACTIVE)
                .teacher(Teacher.builder().id(teacherId).build())
                .startDate(LocalDate.parse("2026-09-01")).endDate(LocalDate.parse("2026-12-31"))
                .daysOfWeek(days).startTime(LocalTime.parse(start)).endTime(LocalTime.parse(end)).room("P.1").build();
    }

    @Test
    void listsEveryTeacherWithOccurrencesAndCountsOverlappingPairs() {
        when(courseRepository.findAll()).thenReturn(List.of(
                course("A", "t1", List.of(1, 3), "18:30", "20:30"),
                course("B", "t1", List.of(1), "19:00", "21:00"),
                course("C", "t2", List.of(2), "09:00", "10:00")));

        List<TeacherScheduleResponse> res = service.schedule(null, MON, SUN, "admin", true);

        assertThat(res).hasSize(2);
        TeacherScheduleResponse first = res.get(0);
        assertThat(first.occurrences()).hasSize(3); // A Mon, A Wed, B Mon
        assertThat(first.conflictCount()).isEqualTo(1);
        assertThat(first.occurrences().stream().filter(TeacherScheduleResponse.Occurrence::conflict)).hasSize(2);
        assertThat(first.courseCodes()).containsExactly("A", "B");
        assertThat(res.get(1).conflictCount()).isZero();
    }

    @Test
    void closedCoursesAreLeftOutAndATeacherWithoutCoursesStillAppears() {
        Course closed = course("A", "t1", List.of(1), "08:00", "09:00");
        closed.setStatus(CourseStatus.CLOSE);
        when(courseRepository.findAll()).thenReturn(List.of(closed));

        List<TeacherScheduleResponse> res = service.schedule("t1", MON, SUN, "admin", true);

        assertThat(res).hasSize(1);
        assertThat(res.get(0).occurrences()).isEmpty();
    }

    @Test
    void nonAdminOnlySeesTheirOwnRow() {
        when(courseRepository.findAll()).thenReturn(List.of(course("C", "t2", List.of(2), "09:00", "10:00")));
        when(teacherService.findByUserId("u2")).thenReturn(Optional.of(minh));

        List<TeacherScheduleResponse> res = service.schedule("t1", MON, SUN, "u2", false);

        assertThat(res).extracting(TeacherScheduleResponse::teacherId).containsExactly("t2");
    }

    @Test
    void nonAdminWithoutATeacherProfileGetsNothing() {
        when(teacherService.findByUserId("u9")).thenReturn(Optional.empty());

        assertThat(service.schedule(null, MON, SUN, "u9", false)).isEmpty();
    }

    @Test
    void rangeMustBeOrderedAndAtMost62Days() {
        assertThatThrownBy(() -> service.schedule(null, SUN, MON, "a", true)).isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> service.schedule(null, MON, MON.plusDays(63), "a", true)).isInstanceOf(BusinessException.class);
    }
}
