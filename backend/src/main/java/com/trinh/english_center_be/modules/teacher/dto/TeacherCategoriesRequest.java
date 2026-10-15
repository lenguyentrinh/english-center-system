package com.trinh.english_center_be.modules.teacher.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record TeacherCategoriesRequest(@NotNull(message = "categoryIds must not be null") List<String> categoryIds) {
}
