package com.trinh.english_center_be.shared.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum Roles {

    ADMIN("Admin"),
    TEACHER("Teacher"),
    STUDENT("Student");

    private final String label;
}