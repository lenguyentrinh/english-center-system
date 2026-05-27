package com.trinh.english_center_be.modules.academic.entity;

import com.trinh.english_center_be.shared.BaseEntity;
import com.trinh.english_center_be.shared.enums.CourseStatus;
import jakarta.persistence.*;
import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import java.time.LocalDate;
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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", unique = true, length = 30)
    private String code;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "max_student")
    private Integer maxStudent;

    @Column(name = "status", length = 20)
    @Enumerated(EnumType.STRING)
    private CourseStatus status;

    @Column(name = "minimum_age")
    private Integer minimumAge;

    @Column(name = "required_entry_level", length = 30)
    private String requiredEntryLevel;

    @Column(name = "prerequisites_required", columnDefinition = "TINYINT DEFAULT 0")
    private Boolean prerequisitesRequired;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;
}