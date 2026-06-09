package com.trinh.english_center_be.modules.academic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record SessionRequest(

        @NotNull(message = "Session number must not be null")
        Integer sessionNo,

        @NotBlank(message = "Title must not be blank")
        String title,

        @NotNull(message = "Session date must not be null")
        LocalDate sessionDate,

        @NotNull(message = "Start time must not be null")
        LocalTime startTime,

        @NotNull(message = "End time must not be null")
        LocalTime endTime,

        String topic
) {
}
