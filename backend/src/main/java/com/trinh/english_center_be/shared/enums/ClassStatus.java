package com.trinh.english_center_be.shared.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ClassStatus {
    OPEN("Open"),
    CLOSE("Close"),
    ACTIVE("Active");

    private final String lable;
}
