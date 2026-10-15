package com.trinh.english_center_be.modules.category.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.trinh.english_center_be.modules.academic.repository.CourseRepository;
import com.trinh.english_center_be.modules.category.dto.CategoryRequest;
import com.trinh.english_center_be.modules.category.entity.Category;
import com.trinh.english_center_be.modules.category.repository.CategoryRepository;
import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import com.trinh.english_center_be.modules.teacher.repository.TeacherRepository;
import com.trinh.english_center_be.shared.exception.BusinessException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class CategoryServiceImplTest {

    @Mock CategoryRepository categoryRepository;
    @Mock CourseRepository courseRepository;
    @Mock TeacherRepository teacherRepository;

    CategoryServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new CategoryServiceImpl(categoryRepository, courseRepository, teacherRepository);
        lenient().when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void nameIsUniqueCaseInsensitively() {
        when(categoryRepository.findByNameKey("ielts")).thenReturn(Optional.of(Category.builder().id("c1").name("IELTS").nameKey("ielts").build()));

        assertThatThrownBy(() -> service.create(new CategoryRequest("  ielts ", null)))
                .isInstanceOfSatisfying(BusinessException.class, e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.CONFLICT));
        verify(categoryRepository, never()).save(any());
    }

    @Test
    void createStoresTrimmedNameKeyAndPaletteColor() {
        when(categoryRepository.findByNameKey("speaking club")).thenReturn(Optional.empty());
        when(categoryRepository.count()).thenReturn(1L);

        var res = service.create(new CategoryRequest(" Speaking Club ", null));

        assertThat(res.name()).isEqualTo("Speaking Club");
        assertThat(res.color()).isEqualTo(CategoryServiceImpl.PALETTE.get(1));
    }

    @Test
    void aSoftDeletedNameComesBackInsteadOfCollidingWithTheUniqueKey() {
        Category old = Category.builder().id("c1").name("TOEIC").nameKey("toeic").color("#000000").active(false).build();
        when(categoryRepository.findByNameKey("toeic")).thenReturn(Optional.of(old));

        var res = service.create(new CategoryRequest("TOEIC", "#0891B2"));

        assertThat(res.id()).isEqualTo("c1");
        assertThat(old.getActive()).isTrue();
        assertThat(res.color()).isEqualTo("#0891b2");
    }

    @Test
    void deleteIsRefusedWhileALiveCourseUsesTheCategory() {
        when(categoryRepository.findById("c1")).thenReturn(Optional.of(Category.builder().id("c1").build()));
        when(courseRepository.existsByCategoryIdAndActiveNot("c1", false)).thenReturn(true);

        assertThatThrownBy(() -> service.softDelete("c1"))
                .isInstanceOfSatisfying(BusinessException.class, e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.CONFLICT));
        verify(categoryRepository, never()).save(any());
    }

    @Test
    void deleteIsSoftAndRemovesTheSpecialtyFromTeachers() {
        Category c = Category.builder().id("c1").build();
        Teacher t = Teacher.builder().id("t1").categoryIds(new ArrayList<>(List.of("c1", "c2"))).build();
        when(categoryRepository.findById("c1")).thenReturn(Optional.of(c));
        when(courseRepository.existsByCategoryIdAndActiveNot("c1", false)).thenReturn(false);
        when(teacherRepository.findByCategoryIdsContaining("c1")).thenReturn(List.of(t));

        service.softDelete("c1");

        assertThat(c.getActive()).isFalse();
        assertThat(t.getCategoryIds()).containsExactly("c2");
        verify(teacherRepository).saveAll(List.of(t));
    }

    @Test
    void requireAllActiveRejectsUnknownOrDeletedIdsAndDeduplicates() {
        when(categoryRepository.findById("a")).thenReturn(Optional.of(Category.builder().id("a").build()));
        when(categoryRepository.findById("gone")).thenReturn(Optional.of(Category.builder().id("gone").active(false).build()));

        assertThat(service.requireAllActive(List.of("a", "a"))).containsExactly("a");
        assertThatThrownBy(() -> service.requireAllActive(List.of("a", "gone"))).isInstanceOf(BusinessException.class);
    }

    @Test
    void renameToAnotherCategorysNameConflicts() {
        when(categoryRepository.findById("c1")).thenReturn(Optional.of(Category.builder().id("c1").name("A").build()));
        when(categoryRepository.findByNameKey("b")).thenReturn(Optional.of(Category.builder().id("c2").build()));

        assertThatThrownBy(() -> service.update("c1", new CategoryRequest("B", null))).isInstanceOf(BusinessException.class);
    }
}
