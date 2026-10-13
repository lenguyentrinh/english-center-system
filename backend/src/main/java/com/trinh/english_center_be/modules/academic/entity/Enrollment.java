package com.trinh.english_center_be.modules.academic.entity;

import com.trinh.english_center_be.modules.student.entity.Student;
import com.trinh.english_center_be.shared.BaseEntity;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "enrollments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Enrollment extends BaseEntity {

    @Id
    private String id;

    @DBRef(lazy = true)
    private Student student;

    @DBRef(lazy = true)
    private Course course;

    private LocalDate enrollDate;

    private String status;

    private Boolean ageEligible;

    private Boolean entryLevelEligible;

    private Boolean prerequisitesEligible;

    private LocalDateTime eligibilityCheckDate;
}
