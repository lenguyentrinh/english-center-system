package com.trinh.english_center_be.modules.student.entity;

import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.shared.BaseEntity;
import com.trinh.english_center_be.shared.enums.EntryLevel;
import com.trinh.english_center_be.shared.enums.Gender;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Student extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender")
    private Gender gender;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "parent_name", length = 50)
    private String parentName;

    @Column(name = "parent_phone", length = 10)
    private String parentPhone;

    private EntryLevel entryLevel;

    @Column(name = "prerequisites_completed", columnDefinition = "TINYINT DEFAULT 0")
    private Boolean prerequisitesCompleted;
}
