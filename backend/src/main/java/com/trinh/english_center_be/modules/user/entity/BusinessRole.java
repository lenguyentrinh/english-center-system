package com.trinh.english_center_be.modules.user.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import com.trinh.english_center_be.shared.BaseEntity;
import com.trinh.english_center_be.shared.enums.BusinessRoles;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * The roles that belong to a business role are not stored here; they are looked up through
 * {@code RoleRepository.findByBusinessRole(...)} because {@link Role} holds the reference.
 */
@Entity
@Table(name = "business_roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(of = "id", callSuper = false)
public class BusinessRole extends BaseEntity {

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;

    @Column(unique = true)
    @Enumerated(EnumType.STRING)
    private BusinessRoles code;

    private String description;
}
