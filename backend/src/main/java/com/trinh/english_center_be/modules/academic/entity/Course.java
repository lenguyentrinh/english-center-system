package com.trinh.english_center_be.modules.academic.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import com.trinh.english_center_be.shared.BaseEntity;
import com.trinh.english_center_be.shared.enums.CourseStatus;
import com.trinh.english_center_be.shared.enums.Roles;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Course extends BaseEntity {

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;

    @Column(unique = true)
    private String code;

    private String name;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer maxStudent;

    @Enumerated(EnumType.STRING)

    private CourseStatus status;

    private Integer minimumAge;

    private String requiredEntryLevel;

    private Boolean prerequisitesRequired;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    /** Legacy teacher-role gate, kept so old data loads; qualification now uses categoryId and Teacher.categoryIds. */
    @Enumerated(EnumType.STRING)
    private Roles availableRoleTeacher;

    /** Optional admin-managed Category id (program/tag). */
    private String categoryId;

    private String room;

    /** ISO weekdays, 1 = Monday .. 7 = Sunday. Null/empty for legacy courses without a weekly pattern. */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "course_days_of_week", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "day_of_week")
    private List<Integer> daysOfWeek;

    private LocalTime startTime;

    private LocalTime endTime;
}
