package com.trinh.english_center_be.shared.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@AllArgsConstructor
public enum CourseStatus {
    OPEN("Open"),
    CLOSE("Close"),
    ACTIVE("Active");

    private final String label;
}
