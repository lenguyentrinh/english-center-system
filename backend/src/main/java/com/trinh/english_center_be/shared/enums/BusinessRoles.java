package com.trinh.english_center_be.shared.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum BusinessRoles {
    TOEIC_TEACHING_INTERMEDIATE("Toeic Teaching Intermediate"),
    TOEIC_TEACHING_ADVANCED("Toeic Teaching Advanced"),
    IELTS_TEACHING_INTERMEDIATE("Ielts Teaching Intermediate"),
    IELTS_TEACHING_ADVANCED("Ielts Teaching Advanced"),
    ENGLISH_COMMUNICATION_BASIC("English Communication Basic"),
    ENGLISH_COMMUNICATION_ADVANCED("English Communication Advanced");
    private final String label;
}
