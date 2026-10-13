package com.trinh.english_center_be.modules.academic.entity;

import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import com.trinh.english_center_be.shared.BaseEntity;
import com.trinh.english_center_be.shared.enums.CourseStatus;
import com.trinh.english_center_be.shared.enums.Roles;
import java.time.LocalDate;
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

    private Roles availableRoleTeacher;
}
