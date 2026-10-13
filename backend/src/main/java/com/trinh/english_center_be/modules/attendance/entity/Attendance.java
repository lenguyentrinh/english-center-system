package com.trinh.english_center_be.modules.attendance.entity;

import com.trinh.english_center_be.modules.academic.entity.CourseSession;
import com.trinh.english_center_be.modules.student.entity.Student;
import com.trinh.english_center_be.shared.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "attendance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Attendance extends BaseEntity {

    @Id
    private String id;

    @DBRef(lazy = true)
    private CourseSession session;

    @DBRef(lazy = true)
    private Student student;

    private String status;

    private String note;
}
