package com.trinh.english_center_be.modules.student.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.shared.BaseEntity;
import com.trinh.english_center_be.shared.enums.EntryLevel;
import com.trinh.english_center_be.shared.enums.Gender;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
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
    @UuidGenerator
    @Column(length = 36)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)

    private Gender gender;

    private String address;

    private String parentName;

    private String parentPhone;

    @Enumerated(EnumType.STRING)

    private EntryLevel entryLevel;

    private Boolean prerequisitesCompleted;
}
