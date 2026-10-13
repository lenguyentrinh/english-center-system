package com.trinh.english_center_be.modules.user.entity;

import com.trinh.english_center_be.shared.BaseEntity;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Join document between a user and a role. Stores ids (not DBRefs) so lookups are simple
 * equality queries; the (userId, roleId) pair is unique.
 */
@Document(collection = "user_roles")
@CompoundIndex(name = "uk_user_role", def = "{'userId': 1, 'roleId': 1}", unique = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class UserRole extends BaseEntity {

    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed
    private String roleId;

    @CreatedDate
    private LocalDateTime assignedAt;
}
