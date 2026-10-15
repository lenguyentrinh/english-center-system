package com.trinh.english_center_be.modules.academic.service.impl;

import com.trinh.english_center_be.modules.academic.dto.TeacherScheduleResponse;
import com.trinh.english_center_be.modules.academic.entity.Course;
import com.trinh.english_center_be.modules.academic.repository.CourseRepository;
import com.trinh.english_center_be.modules.academic.service.CourseScheduleService;
import com.trinh.english_center_be.modules.academic.service.ScheduleRules;
import com.trinh.english_center_be.modules.academic.service.ScheduleRules.Occurrence;
import com.trinh.english_center_be.modules.teacher.dto.TeacherResponse;
import com.trinh.english_center_be.modules.teacher.service.TeacherService;
import com.trinh.english_center_be.shared.exception.BusinessException;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CourseScheduleServiceImpl implements CourseScheduleService {

    static final int MAX_RANGE_DAYS = 62;

    private final CourseRepository courseRepository;
    private final TeacherService teacherService;

    @Override
    public List<TeacherScheduleResponse> schedule(String teacherId, LocalDate from, LocalDate to, String actingUserId, boolean admin) {
        LocalDate start = from != null ? from : LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate end = to != null ? to : start.plusDays(6);
        if (end.isBefore(start)) throw new BusinessException("'to' must not be before 'from'", HttpStatus.BAD_REQUEST);
        if (start.plusDays(MAX_RANGE_DAYS).isBefore(end)) {
            throw new BusinessException("Range is limited to " + MAX_RANGE_DAYS + " days", HttpStatus.BAD_REQUEST);
        }

        String wantedTeacher = teacherId;
        if (!admin) {
            // Non-admins only ever see their own calendar.
            wantedTeacher = teacherService.findByUserId(actingUserId).map(TeacherResponse::id).orElse(null);
            if (wantedTeacher == null) return List.of();
        }

        List<TeacherResponse> teachers = new ArrayList<>(teacherService.findTeachers(null));
        if (wantedTeacher != null) {
            String id = wantedTeacher;
            teachers.removeIf(t -> !t.id().equals(id));
        }

        List<Course> courses = courseRepository.findAll().stream()
                .filter(ScheduleRules::occupies)
                .filter(c -> c.getTeacher() != null)
                .toList();

        List<TeacherScheduleResponse> out = new ArrayList<>();
        for (TeacherResponse t : teachers) {
            List<Course> mine = courses.stream().filter(c -> t.id().equals(c.getTeacher().getId())).toList();
            List<Occurrence> dated = new ArrayList<>();
            mine.forEach(c -> dated.addAll(ScheduleRules.occurrences(c, start, end)));
            dated.sort(Comparator.comparing(Occurrence::date).thenComparing(Occurrence::start));

            Set<Integer> clashing = new HashSet<>();
            int pairs = 0;
            for (int i = 0; i < dated.size(); i++) {
                for (int j = i + 1; j < dated.size(); j++) {
                    Occurrence a = dated.get(i);
                    Occurrence b = dated.get(j);
                    if (a.date().equals(b.date()) && a.start().isBefore(b.end()) && b.start().isBefore(a.end())) {
                        pairs++;
                        clashing.add(i);
                        clashing.add(j);
                    }
                }
            }

            List<TeacherScheduleResponse.Occurrence> items = new ArrayList<>();
            for (int i = 0; i < dated.size(); i++) {
                Occurrence o = dated.get(i);
                Course c = o.course();
                items.add(new TeacherScheduleResponse.Occurrence(o.date(), o.start(), o.end(), c.getId(), c.getCode(),
                        c.getName(), c.getRoom(), c.getCategoryId(), clashing.contains(i)));
            }
            Set<String> codes = new LinkedHashSet<>();
            mine.forEach(c -> codes.add(c.getCode()));
            out.add(new TeacherScheduleResponse(t.id(), t.userId(), t.fullName(), t.roles(), t.categoryIds(),
                    List.copyOf(codes), pairs, items));
        }
        return out;
    }
}
