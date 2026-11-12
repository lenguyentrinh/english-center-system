package com.trinh.english_center_be.modules.teacher.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.shared.BaseEntity;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "teachers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Teacher extends BaseEntity {

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(precision = 15, scale = 2)
    private BigDecimal salary;

    /** Category ids this teacher can teach (admin-managed specialties). */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "teacher_categories", joinColumns = @JoinColumn(name = "teacher_id"))
    @Column(name = "category_id", length = 36)
    @Builder.Default
    private List<String> categoryIds = new ArrayList<>();
}
