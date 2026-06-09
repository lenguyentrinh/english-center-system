package com.trinh.english_center_be.modules.academic.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record SessionResponse(
        Long id,
        Integer sessionNo,
        String title,
        LocalDate sessionDate,
        LocalTime startTime,
        LocalTime endTime,
        String topic
) {
}
