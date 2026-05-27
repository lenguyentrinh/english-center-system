package com.trinh.english_center_be.modules.academic.entity;

import com.trinh.english_center_be.shared.BaseEntity;
import com.trinh.english_center_be.shared.enums.ClassStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
    private ClassStatus status;

    @Column(name = "minimum_age")
    private Integer minimumAge;

    @Column(name = "required_entry_level", length = 30)
    private String requiredEntryLevel;

    @Column(name = "prerequisites_required", columnDefinition = "TINYINT DEFAULT 0")
    private Boolean prerequisitesRequired;
}