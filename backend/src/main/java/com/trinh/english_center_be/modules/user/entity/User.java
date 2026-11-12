package com.trinh.english_center_be.modules.user.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import com.trinh.english_center_be.shared.BaseEntity;
import com.trinh.english_center_be.shared.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class User extends BaseEntity {

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;

    @Column(unique = true)
    private String username;

    private String password;

    @Column(unique = true)
    private String email;

    private String fullName;

    private String phone;

    @Enumerated(EnumType.STRING)

    private UserStatus status;

    /**
     * Null on accounts created before verification existed; those count as verified. Self-registered
     * accounts start false; admin-created accounts and completed password resets set true.
     */
    private Boolean emailVerified;

    public boolean isEmailVerified() {
        return emailVerified == null || emailVerified;
    }
}
