package com.trinh.english_center_be.modules.user.entity;

import com.trinh.english_center_be.shared.BaseEntity;
import com.trinh.english_center_be.shared.enums.BusinessRoles;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * The roles that belong to a business role are not stored here; they are looked up through
 * {@code RoleRepository.findByBusinessRole(...)} because {@link Role} holds the reference.
 */
@Document(collection = "business_roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(of = "id", callSuper = false)
public class BusinessRole extends BaseEntity {

    @Id
    private String id;

    @Indexed(unique = true, sparse = true)
    private BusinessRoles code;

    private String description;
}
