package com.trinh.english_center_be.modules.user.entity;

import com.trinh.english_center_be.shared.BaseEntity;
import com.trinh.english_center_be.shared.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class User extends BaseEntity {

    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    private String password;

    @Indexed(unique = true, sparse = true)
    private String email;

    private String fullName;

    private String phone;

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
