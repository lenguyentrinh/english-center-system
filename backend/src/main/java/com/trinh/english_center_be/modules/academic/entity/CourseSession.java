package com.trinh.english_center_be.modules.academic.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import com.trinh.english_center_be.shared.BaseEntity;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "course_sessions",
        indexes = @Index(name = "course_session_no_idx", columnList = "course_id, session_no"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CourseSession extends BaseEntity {

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    // Teacher assignment lives on Course (one teacher per course).

    private Integer sessionNo;

    private String title;

    private LocalDate sessionDate;

    private LocalTime startTime;

    private LocalTime endTime;

    @Column(length = 1000)
    private String topic;
}
