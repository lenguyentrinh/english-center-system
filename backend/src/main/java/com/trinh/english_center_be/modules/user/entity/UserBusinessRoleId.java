package com.trinh.english_center_be.modules.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class UserBusinessRoleId implements Serializable {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "business_role_id")
    private Long businessRoleId;
}
