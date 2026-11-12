package com.trinh.english_center_be.modules.academic.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import com.trinh.english_center_be.shared.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "session_materials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SessionMaterial extends BaseEntity {

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private CourseSession session;

    private String fileName;

    @Column(length = 1000)
    private String fileUrl;

    private String fileType;

    /** Id of the uploading user (String id, not a foreign key). */
    private String uploadedBy;
}
