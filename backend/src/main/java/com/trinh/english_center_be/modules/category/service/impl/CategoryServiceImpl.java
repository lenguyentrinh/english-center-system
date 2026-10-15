package com.trinh.english_center_be.modules.category.service.impl;

import com.trinh.english_center_be.modules.academic.repository.CourseRepository;
import com.trinh.english_center_be.modules.category.dto.CategoryRequest;
import com.trinh.english_center_be.modules.category.dto.CategoryResponse;
import com.trinh.english_center_be.modules.category.entity.Category;
import com.trinh.english_center_be.modules.category.mapper.CategoryMapper;
import com.trinh.english_center_be.modules.category.repository.CategoryRepository;
import com.trinh.english_center_be.modules.category.service.CategoryService;
import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import com.trinh.english_center_be.modules.teacher.repository.TeacherRepository;
import com.trinh.english_center_be.shared.exception.BusinessException;
import com.trinh.english_center_be.shared.exception.ResourceNotFoundException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    /** Defaults handed out round-robin when the admin does not pick a color. */
    static final List<String> PALETTE =
            List.of("#2563eb", "#0891b2", "#059669", "#f59e0b", "#e11d48", "#64748b", "#ea580c", "#0d9488");

    private final CategoryRepository categoryRepository;
    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;

    static String keyOf(String name) {
        return name.trim().toLowerCase(Locale.ROOT);
    }

    @Override
    public List<CategoryResponse> findAll() {
        return categoryRepository.findByActiveTrueOrderByNameAsc().stream().map(CategoryMapper::toResponse).toList();
    }

    @Override
    public CategoryResponse create(CategoryRequest request) {
        String name = request.name().trim();
        String key = keyOf(name);
        Category existing = categoryRepository.findByNameKey(key).orElse(null);
        if (existing != null) {
            if (!Boolean.FALSE.equals(existing.getActive())) {
                throw new BusinessException("Category '" + name + "' already exists", HttpStatus.CONFLICT);
            }
            // A soft-deleted category with the same name comes back instead of colliding with its unique key.
            existing.setActive(true);
            existing.setName(name);
            existing.setColor(colorOrDefault(request.color()));
            return CategoryMapper.toResponse(categoryRepository.save(existing));
        }
        Category created = Category.builder().name(name).nameKey(key).color(colorOrDefault(request.color())).build();
        return CategoryMapper.toResponse(categoryRepository.save(created));
    }

    @Override
    public CategoryResponse update(String id, CategoryRequest request) {
        Category category = requireActive(id);
        String name = request.name().trim();
        String key = keyOf(name);
        categoryRepository.findByNameKey(key)
                .filter(other -> !other.getId().equals(id))
                .ifPresent(other -> {
                    throw new BusinessException("Category '" + name + "' already exists", HttpStatus.CONFLICT);
                });
        category.setName(name);
        category.setNameKey(key);
        if (request.color() != null) category.setColor(request.color().toLowerCase(Locale.ROOT));
        return CategoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    public void softDelete(String id) {
        Category category = requireActive(id);
        if (courseRepository.existsByCategoryIdAndActiveNot(id, false)) {
            throw new BusinessException("Category is used by a course and cannot be deleted", HttpStatus.CONFLICT);
        }
        category.setActive(false);
        categoryRepository.save(category);

        // Teachers keep no dangling specialty.
        List<Teacher> affected = teacherRepository.findByCategoryIdsContaining(id);
        affected.forEach(t -> t.getCategoryIds().remove(id));
        if (!affected.isEmpty()) teacherRepository.saveAll(affected);
    }

    @Override
    public Category requireActive(String id) {
        return categoryRepository.findById(id)
                .filter(c -> !Boolean.FALSE.equals(c.getActive()))
                .orElseThrow(() -> new ResourceNotFoundException("Category not found by id: " + id));
    }

    @Override
    public List<String> requireAllActive(Collection<String> ids) {
        if (ids == null) return List.of();
        List<String> result = new ArrayList<>(new LinkedHashSet<>(ids));
        for (String id : result) {
            categoryRepository.findById(id)
                    .filter(c -> !Boolean.FALSE.equals(c.getActive()))
                    .orElseThrow(() -> new BusinessException("Unknown or deleted category: " + id, HttpStatus.BAD_REQUEST));
        }
        return result;
    }

    private String colorOrDefault(String color) {
        if (color != null) return color.toLowerCase(Locale.ROOT);
        return PALETTE.get((int) (categoryRepository.count() % PALETTE.size()));
    }
}
