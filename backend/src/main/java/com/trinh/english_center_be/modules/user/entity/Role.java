package com.trinh.english_center_be.modules.user.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import com.trinh.english_center_be.shared.BaseEntity;
import com.trinh.english_center_be.shared.enums.Roles;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(of = "id", callSuper = false)
public class Role extends BaseEntity {

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;

    @Column(unique = true)
    @Enumerated(EnumType.STRING)
    private Roles code;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_role_id")
    private BusinessRole businessRole;
}
