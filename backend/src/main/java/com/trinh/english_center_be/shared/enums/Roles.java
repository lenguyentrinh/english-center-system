package com.trinh.english_center_be.shared.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum Roles {

    ADMIN("Admin"),
    TEACHER("Teacher"),
    STUDENT("Student"),

    TEACHER_IELTS_6("IELTS Teacher 6.0"),
    TEACHER_IELTS_7("IELTS Teacher 7.0"),
    TEACHER_IELTS_8("IELTS Teacher 8.0"),

    TEACHER_TOEIC_650("TOEIC Teacher 650+"),
    TEACHER_TOEIC_750("TOEIC Teacher 750+"),
    TEACHER_TOEIC_850("TOEIC Teacher 850+");

    private final String label;
}