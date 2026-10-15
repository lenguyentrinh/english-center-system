package com.trinh.english_center_be.modules.academic.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.trinh.english_center_be.modules.academic.entity.Course;
import com.trinh.english_center_be.shared.enums.CourseStatus;
import com.trinh.english_center_be.shared.exception.BusinessException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.Test;

class ScheduleRulesTest {

    private static Course course(String id, List<Integer> days, String start, String end, String from, String to) {
        return Course.builder().id(id).code(id).status(CourseStatus.ACTIVE).daysOfWeek(days)
                .startTime(LocalTime.parse(start)).endTime(LocalTime.parse(end))
                .startDate(LocalDate.parse(from)).endDate(LocalDate.parse(to)).build();
    }

    @Test
    void emptyScheduleIsValidButPartialScheduleIsNot() {
        assertThatCode(() -> ScheduleRules.validate(null, null, null)).doesNotThrowAnyException();
        assertThatThrownBy(() -> ScheduleRules.validate(List.of(1), null, LocalTime.of(9, 0))).isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> ScheduleRules.validate(List.of(), LocalTime.of(8, 0), LocalTime.of(9, 0))).isInstanceOf(BusinessException.class);
    }

    @Test
    void rejectsBadWeekdayInvertedTimesAndOutOfHours() {
        assertThatThrownBy(() -> ScheduleRules.validate(List.of(8), LocalTime.of(8, 0), LocalTime.of(9, 0))).isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> ScheduleRules.validate(List.of(1), LocalTime.of(9, 0), LocalTime.of(9, 0))).isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> ScheduleRules.validate(List.of(1), LocalTime.of(6, 30), LocalTime.of(8, 0))).isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> ScheduleRules.validate(List.of(1), LocalTime.of(21, 0), LocalTime.of(22, 30))).isInstanceOf(BusinessException.class);
        assertThatCode(() -> ScheduleRules.validate(List.of(1, 3), LocalTime.of(7, 0), LocalTime.of(22, 0))).doesNotThrowAnyException();
    }

    @Test
    void overlapNeedsSharedDayOverlappingTimeAndOverlappingDates() {
        Course a = course("A", List.of(1, 3), "18:30", "20:30", "2026-09-01", "2026-12-20");
        assertThat(ScheduleRules.overlaps(a, course("B", List.of(3, 5), "20:00", "21:00", "2026-10-01", "2027-01-01"))).isTrue();
        // back-to-back is not a clash
        assertThat(ScheduleRules.overlaps(a, course("C", List.of(1), "20:30", "21:30", "2026-09-01", "2026-12-20"))).isFalse();
        // different weekday
        assertThat(ScheduleRules.overlaps(a, course("D", List.of(2), "18:30", "20:30", "2026-09-01", "2026-12-20"))).isFalse();
        // date windows do not intersect
        assertThat(ScheduleRules.overlaps(a, course("E", List.of(1), "18:30", "20:30", "2027-01-01", "2027-03-01"))).isFalse();
    }

    @Test
    void closedOrDeletedCoursesNeverConflict() {
        Course a = course("A", List.of(1), "08:00", "09:00", "2026-09-01", "2026-12-20");
        Course closed = course("B", List.of(1), "08:00", "09:00", "2026-09-01", "2026-12-20");
        closed.setStatus(CourseStatus.CLOSE);
        Course deleted = course("C", List.of(1), "08:00", "09:00", "2026-09-01", "2026-12-20");
        deleted.setActive(false);

        assertThat(ScheduleRules.conflicts(a, List.of(closed, deleted))).isEmpty();
    }

    @Test
    void aCourseNeverConflictsWithItself() {
        Course a = course("A", List.of(1), "08:00", "09:00", "2026-09-01", "2026-12-20");
        assertThat(ScheduleRules.conflicts(a, List.of(a))).isEmpty();
    }

    @Test
    void occurrencesExpandTheWeeklyPatternInsideTheCourseDates() {
        // 2026-10-12 is a Monday
        Course a = course("A", List.of(1, 3), "18:30", "20:30", "2026-10-14", "2026-10-30");
        var week = ScheduleRules.occurrences(a, LocalDate.parse("2026-10-12"), LocalDate.parse("2026-10-18"));

        assertThat(week).extracting(ScheduleRules.Occurrence::date).containsExactly(LocalDate.parse("2026-10-14"));
        var twoWeeks = ScheduleRules.occurrences(a, LocalDate.parse("2026-10-12"), LocalDate.parse("2026-10-25"));
        assertThat(twoWeeks).extracting(ScheduleRules.Occurrence::date)
                .containsExactly(LocalDate.parse("2026-10-14"), LocalDate.parse("2026-10-19"), LocalDate.parse("2026-10-21"));
    }
}
