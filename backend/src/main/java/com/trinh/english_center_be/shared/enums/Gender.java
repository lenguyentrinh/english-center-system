package com.trinh.english_center_be.shared.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum Gender {
    MALE("Male"),
    FEMALE("Female"),
    OTHER("other");
    private final String label;
}
