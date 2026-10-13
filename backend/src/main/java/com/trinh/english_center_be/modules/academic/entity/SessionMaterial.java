package com.trinh.english_center_be.modules.academic.entity;

import com.trinh.english_center_be.shared.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "session_materials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SessionMaterial extends BaseEntity {

    @Id
    private String id;

    @DBRef(lazy = true)
    private CourseSession session;

    private String fileName;

    private String fileUrl;

    private String fileType;

    /** Id of the uploading user (String ObjectId, not a DBRef). */
    private String uploadedBy;
}
