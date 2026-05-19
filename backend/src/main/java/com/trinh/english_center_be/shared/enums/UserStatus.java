package com.trinh.english_center_be.shared.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum UserStatus {
    ACTIVE("Active"),
    INACTIVE("Inactive"),
    LOCKED("Locked");

    private final String label;
}
