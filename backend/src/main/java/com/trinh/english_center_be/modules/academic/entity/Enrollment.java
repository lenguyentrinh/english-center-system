package com.trinh.english_center_be.modules.academic.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import com.trinh.english_center_be.modules.student.entity.Student;
import com.trinh.english_center_be.shared.BaseEntity;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "enrollments",
        indexes = @Index(name = "enrollment_course_student_idx", columnList = "course_id, student_id, status"))
// A student can hold at most one ACTIVE enrollment per course (enforced in EnrollmentServiceImpl, MySQL has no
// partial unique index); cancelled rows are history and may repeat.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Enrollment extends BaseEntity {

    public static final String ACTIVE = "ACTIVE";
    public static final String CANCELLED = "CANCELLED";

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    private LocalDate enrollDate;

    private String status;

    private Boolean ageEligible;

    private Boolean entryLevelEligible;

    private Boolean prerequisitesEligible;

    private LocalDateTime eligibilityCheckDate;
}
