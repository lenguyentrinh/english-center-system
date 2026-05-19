package com.trinh.english_center_be.shared.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum EntryLevel {
    PRE_A1("Just starting out","10 - 120 TOEIC","Below 3.0"),
    A1("Beginner", "120 - 225 TOEIC", "3.0 - 3.5 IELTS"),
    A2("Elementary", "225 - 550 TOEIC", "4.0 - 5.0 IELTS"),
    B1("Intermediate", "550 - 780 TOEIC", "5.0 - 6.0 IELTS"),
    B2("Upper Intermediate", "785 - 940 TOEIC", "6.0 - 7.0 IELTS"),
    C1("Advanced", "945 - 990 TOEIC", "7.0 - 8.0 IELTS"),
    C2("Proficient", "990 TOEIC", "8.5 - 9.0 IELTS");
    private final String description;
    private final String toeicRange;
    private final String ieltsRange;
}
