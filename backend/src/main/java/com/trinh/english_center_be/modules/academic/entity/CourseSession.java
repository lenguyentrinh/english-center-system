package com.trinh.english_center_be.modules.academic.entity;

import com.trinh.english_center_be.shared.BaseEntity;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "course_sessions")
@CompoundIndex(name = "course_session_no_idx", def = "{'course': 1, 'sessionNo': 1}")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CourseSession extends BaseEntity {

    @Id
    private String id;

    @DBRef(lazy = true)
    private Course course;

    // Teacher assignment lives on Course (one teacher per course).

    private Integer sessionNo;

    private String title;

    private LocalDate sessionDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private String topic;
}
