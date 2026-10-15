package com.trinh.english_center_be.modules.category.mapper;

import com.trinh.english_center_be.modules.category.dto.CategoryResponse;
import com.trinh.english_center_be.modules.category.entity.Category;

public final class CategoryMapper {
    private CategoryMapper() {}

    public static CategoryResponse toResponse(Category c) {
        return c == null ? null : new CategoryResponse(c.getId(), c.getName(), c.getColor());
    }
}
