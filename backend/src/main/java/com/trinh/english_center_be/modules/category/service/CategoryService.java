package com.trinh.english_center_be.modules.category.service;

import com.trinh.english_center_be.modules.category.dto.CategoryRequest;
import com.trinh.english_center_be.modules.category.dto.CategoryResponse;
import com.trinh.english_center_be.modules.category.entity.Category;
import java.util.Collection;
import java.util.List;

public interface CategoryService {
    List<CategoryResponse> findAll();

    CategoryResponse create(CategoryRequest request);

    CategoryResponse update(String id, CategoryRequest request);

    /** Soft delete; 409 while a live course still uses the category. */
    void softDelete(String id);

    /** The active category, or a not-found exception when missing or deleted. */
    Category requireActive(String id);

    /** Validates that every id is an active category and returns them de-duplicated, in order. */
    List<String> requireAllActive(Collection<String> ids);
}
