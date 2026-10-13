package com.trinh.english_center_be.modules.student.entity;

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
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Student extends BaseEntity {

    @Id
    private String id;

    @Indexed(unique = true)
    @DBRef(lazy = true)
    private User user;

    private LocalDate dateOfBirth;

    private Gender gender;

    private String address;

    private String parentName;

    private String parentPhone;

    private EntryLevel entryLevel;

    private Boolean prerequisitesCompleted;
}
