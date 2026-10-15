package com.trinh.english_center_be.modules.category.entity;

import com.trinh.english_center_be.shared.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/** Admin-managed tag for courses and teacher specialties (e.g. IELTS, TOEIC). Nothing about it is hardcoded. */
@Document(collection = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Category extends BaseEntity {

    @Id
    private String id;

    private String name;

    /** Lower-cased, trimmed name: enforces case-insensitive uniqueness (also against soft-deleted rows). */
    @Indexed(unique = true)
    private String nameKey;

    /** Hex color such as #2563eb. */
    private String color;
}
