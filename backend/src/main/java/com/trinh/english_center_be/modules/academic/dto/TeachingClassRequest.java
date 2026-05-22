package com.trinh.english_center_be.modules.academic.dto;

import com.trinh.english_center_be.shared.enums.ClassStatus;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import jakarta.persistence.Column;
import jakarta.validation.constraints.*;
import lombok.Builder;

import java.time.LocalDate;

public record TeachingClassRequest(

        @NotBlank(message = MessageConstant.CODE_NOT_BLANK)
        @Size(max = Constant.CODE_MAX_LENGTH, message = MessageConstant.CODE_MAX_LENGTH)
        String code,

        @NotBlank(message = MessageConstant.NAME_NOT_BLANK)
        @Size(max = Constant.NAME_MAX_LENGTH, message = MessageConstant.NAME_MAX_LENGTH)
        String name,

        @NotNull(message = MessageConstant.START_DATE_NOT_NULL)
        @FutureOrPresent(message = MessageConstant.START_DATE_FUTURE_OR_PRESENT)
        LocalDate startDate,

        @NotNull(message = MessageConstant.END_DATE_NOT_NULL)
        LocalDate endDate,

        @NotNull(message = MessageConstant.MAX_STUDENT_NOT_NULL)
        @Min(value = Constant.MIN_STUDENT, message = MessageConstant.MAX_STUDENT_MIN)
        Integer maxStudent,

        @NotNull(message = MessageConstant.STATUS_NOT_NULL)
        ClassStatus status
) {
}