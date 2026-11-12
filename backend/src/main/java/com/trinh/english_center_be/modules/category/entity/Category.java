package com.trinh.english_center_be.modules.category.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import com.trinh.english_center_be.shared.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/** Admin-managed tag for courses and teacher specialties (e.g. IELTS, TOEIC). Nothing about it is hardcoded. */
@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Category extends BaseEntity {

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;

    private String name;

    /** Lower-cased, trimmed name: enforces case-insensitive uniqueness (also against soft-deleted rows). */
    @Column(unique = true)
    private String nameKey;

    /** Hex color such as #2563eb. */
    private String color;
}
