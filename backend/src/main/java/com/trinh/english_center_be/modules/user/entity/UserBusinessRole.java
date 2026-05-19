package com.trinh.english_center_be.modules.user.entity;

import com.trinh.english_center_be.shared.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "user_business_roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class UserBusinessRole extends BaseEntity {

    @EmbeddedId
    private UserBusinessRoleId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("businessRoleId")
    @JoinColumn(name = "business_role_id")
    private BusinessRole businessRole;
}
