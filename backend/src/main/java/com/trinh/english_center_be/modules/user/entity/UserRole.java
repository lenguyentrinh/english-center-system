package com.trinh.english_center_be.modules.user.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import com.trinh.english_center_be.shared.BaseEntity;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.CreatedDate;

/**
 * Join entity between a user and a role. Stores ids (not @ManyToOne relations) so lookups are simple
 * equality queries; the (userId, roleId) pair is unique.
 */
@Entity
@Table(name = "user_roles",
        uniqueConstraints = @UniqueConstraint(name = "uk_user_role", columnNames = {"user_id", "role_id"}),
        indexes = @Index(name = "idx_user_role_role", columnList = "role_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class UserRole extends BaseEntity {

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;
    private String userId;
    private String roleId;

    @CreatedDate
    private LocalDateTime assignedAt;
}
