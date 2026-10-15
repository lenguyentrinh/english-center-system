package com.trinh.english_center_be.modules.academic.entity;

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
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Course extends BaseEntity {

    @Id
    private String id;

    @Indexed(unique = true, sparse = true)
    private String code;

    private String name;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer maxStudent;

    private CourseStatus status;

    private Integer minimumAge;

    private String requiredEntryLevel;

    private Boolean prerequisitesRequired;

    @DBRef(lazy = true)
    private Teacher teacher;

    /** Legacy teacher-role gate, kept so old data loads; qualification now uses categoryId and Teacher.categoryIds. */
    private Roles availableRoleTeacher;

    /** Optional admin-managed Category id (program/tag). */
    private String categoryId;

    private String room;

    /** ISO weekdays, 1 = Monday .. 7 = Sunday. Null/empty for legacy courses without a weekly pattern. */
    private List<Integer> daysOfWeek;

    private LocalTime startTime;

    private LocalTime endTime;
}
