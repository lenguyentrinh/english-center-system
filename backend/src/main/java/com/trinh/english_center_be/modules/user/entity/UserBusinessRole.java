package com.trinh.english_center_be.modules.user.entity;

import com.trinh.english_center_be.shared.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Join document between a user and a business role. Stores ids (not DBRefs) so the link can be
 * queried directly; the (userId, businessRoleId) pair is unique.
 */
@Document(collection = "user_business_roles")
@CompoundIndex(name = "uk_user_business_role", def = "{'userId': 1, 'businessRoleId': 1}", unique = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class UserBusinessRole extends BaseEntity {

    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed
    private String businessRoleId;
}
