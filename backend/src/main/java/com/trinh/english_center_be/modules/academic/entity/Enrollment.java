package com.trinh.english_center_be.modules.academic.entity;

import com.trinh.english_center_be.modules.student.entity.Student;
import com.trinh.english_center_be.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "enrollments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Enrollment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "class_id", nullable = false)
    private TeachingClass teachingClass;

    @Column(name = "enroll_date")
    private LocalDate enrollDate;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "age_eligible", columnDefinition = "TINYINT")
    private Boolean ageEligible;

    @Column(name = "entry_level_eligible", columnDefinition = "TINYINT")
    private Boolean entryLevelEligible;

    @Column(name = "prerequisites_eligible", columnDefinition = "TINYINT")
    private Boolean prerequisitesEligible;

    @Column(name = "eligibility_check_date")
    private LocalDateTime eligibilityCheckDate  ;
}
