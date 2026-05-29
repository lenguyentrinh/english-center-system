package com.trinh.english_center_be.modules.teacher.dto;

import java.math.BigDecimal;

public record TeacherUpsertRequest(
        BigDecimal salary
) {
}
