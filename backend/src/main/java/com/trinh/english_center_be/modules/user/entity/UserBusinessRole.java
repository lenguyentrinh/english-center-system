package com.trinh.english_center_be.modules.user.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import com.trinh.english_center_be.shared.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Join entity between a user and a business role. Stores ids (not @ManyToOne relations) so the link can be
 * queried directly; the (userId, businessRoleId) pair is unique.
 */
@Entity
@Table(name = "user_business_roles",
        uniqueConstraints = @UniqueConstraint(name = "uk_user_business_role", columnNames = {"user_id", "business_role_id"}),
        indexes = @Index(name = "idx_user_business_role_br", columnList = "business_role_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class UserBusinessRole extends BaseEntity {

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;
    private String userId;
    private String businessRoleId;
}
