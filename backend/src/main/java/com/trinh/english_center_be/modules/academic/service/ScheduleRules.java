package com.trinh.english_center_be.modules.academic.service;

import com.trinh.english_center_be.modules.academic.entity.Course;
import com.trinh.english_center_be.shared.enums.CourseStatus;
import com.trinh.english_center_be.shared.exception.BusinessException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import org.springframework.http.HttpStatus;

/** Pure weekly-schedule rules: validation, overlap detection and date expansion. No I/O. */
public final class ScheduleRules {

    public static final LocalTime DAY_START = LocalTime.of(7, 0);
    public static final LocalTime DAY_END = LocalTime.of(22, 0);

    private ScheduleRules() {}

    /** One dated session produced by a course's weekly pattern. */
    public record Occurrence(LocalDate date, LocalTime start, LocalTime end, Course course) {}

    /** All schedule fields are optional together; if any is given they must form a valid weekly pattern. */
    public static void validate(List<Integer> days, LocalTime start, LocalTime end) {
        boolean any = (days != null && !days.isEmpty()) || start != null || end != null;
        if (!any) return;
        if (days == null || days.isEmpty()) throw bad("Choose at least one weekday");
        if (days.stream().anyMatch(d -> d == null || d < 1 || d > 7)) throw bad("Weekdays must be 1 (Monday) to 7 (Sunday)");
        if (start == null || end == null) throw bad("Start and end time are both required");
        if (!end.isAfter(start)) throw bad("End time must be after start time");
        if (start.isBefore(DAY_START) || end.isAfter(DAY_END)) throw bad("Sessions must fall between 07:00 and 22:00");
    }

    public static boolean hasSchedule(Course c) {
        return c.getDaysOfWeek() != null && !c.getDaysOfWeek().isEmpty() && c.getStartTime() != null && c.getEndTime() != null;
    }

    /** A course that still occupies its teacher: live, scheduled and not CLOSE. */
    public static boolean occupies(Course c) {
        return !Boolean.FALSE.equals(c.getActive()) && c.getStatus() != CourseStatus.CLOSE && hasSchedule(c)
                && c.getStartDate() != null && c.getEndDate() != null;
    }

    /** Same date window, a shared weekday and overlapping clock time. */
    public static boolean overlaps(Course a, Course b) {
        if (!hasSchedule(a) || !hasSchedule(b)) return false;
        if (a.getEndDate().isBefore(b.getStartDate()) || b.getEndDate().isBefore(a.getStartDate())) return false;
        if (a.getDaysOfWeek().stream().noneMatch(b.getDaysOfWeek()::contains)) return false;
        return a.getStartTime().isBefore(b.getEndTime()) && b.getStartTime().isBefore(a.getEndTime());
    }

    /** Courses among {@code others} (excluding {@code candidate} itself) that collide with it. */
    public static List<Course> conflicts(Course candidate, Collection<Course> others) {
        if (!occupies(candidate)) return List.of();
        List<Course> out = new ArrayList<>();
        for (Course other : others) {
            boolean same = candidate.getId() != null && candidate.getId().equals(other.getId());
            if (!same && occupies(other) && overlaps(candidate, other)) out.add(other);
        }
        return out;
    }

    /** Dated sessions of {@code course} inside [from, to] (inclusive), clipped to the course dates. */
    public static List<Occurrence> occurrences(Course course, LocalDate from, LocalDate to) {
        if (!occupies(course)) return List.of();
        LocalDate d = from.isAfter(course.getStartDate()) ? from : course.getStartDate();
        LocalDate last = to.isBefore(course.getEndDate()) ? to : course.getEndDate();
        List<Occurrence> out = new ArrayList<>();
        for (; !d.isAfter(last); d = d.plusDays(1)) {
            if (course.getDaysOfWeek().contains(d.getDayOfWeek().getValue())) {
                out.add(new Occurrence(d, course.getStartTime(), course.getEndTime(), course));
            }
        }
        return out;
    }

    private static BusinessException bad(String message) {
        return new BusinessException(message, HttpStatus.BAD_REQUEST);
    }
}
