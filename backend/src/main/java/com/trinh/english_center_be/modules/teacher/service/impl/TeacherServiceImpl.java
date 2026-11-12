package com.trinh.english_center_be.modules.teacher.service.impl;

import com.trinh.english_center_be.modules.category.service.CategoryService;
import com.trinh.english_center_be.modules.teacher.dto.TeacherResponse;
import com.trinh.english_center_be.modules.teacher.dto.TeacherUpsertRequest;
import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import com.trinh.english_center_be.modules.teacher.mapper.TeacherMapper;
import com.trinh.english_center_be.modules.teacher.repository.TeacherRepository;
import com.trinh.english_center_be.modules.teacher.service.TeacherService;
import com.trinh.english_center_be.modules.user.Repository.UserRepository;
import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.modules.user.service.UserService;
import com.trinh.english_center_be.shared.exception.ResourceNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TeacherServiceImpl implements TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserService userService;
    private final UserRepository userRepository;
    private final CategoryService categoryService;
    private final com.trinh.english_center_be.modules.academic.repository.CourseRepository courseRepository;

    @Override
    public List<TeacherResponse> findTeachers() {
        return teacherRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public Optional<TeacherResponse> findById(String id) {
        return teacherRepository.findById(id).map(this::toResponse);
    }

    @Override
    public Optional<TeacherResponse> findByUserId(String userId) {
        return userRepository.findById(userId)
                .flatMap(teacherRepository::findByUser)
                .map(this::toResponse);
    }

    @Override
    public TeacherResponse upsertByUserId(String userId, TeacherUpsertRequest request) {
        User user = userService.findById(userId);
        Teacher t = teacherRepository.findByUser(user).orElseGet(() -> Teacher.builder().user(user).build());
        t.setSalary(request.salary());
        return toResponse(teacherRepository.save(t));
    }

    @Override
    public TeacherResponse updateCategories(String teacherId, List<String> categoryIds) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found by id: " + teacherId));
        List<String> next = new ArrayList<>(categoryService.requireAllActive(categoryIds));
        String blocking = courseRepository.findByTeacher(teacher).stream()
                .filter(c -> !Boolean.FALSE.equals(c.getActive()) && c.getStatus() != com.trinh.english_center_be.shared.enums.CourseStatus.CLOSE)
                .filter(c -> c.getCategoryId() != null && !next.contains(c.getCategoryId()))
                .map(c -> c.getCode())
                .collect(java.util.stream.Collectors.joining(", "));
        if (!blocking.isEmpty()) {
            throw new com.trinh.english_center_be.shared.exception.BusinessException(
                    "Teacher still teaches courses of the removed categories: " + blocking, org.springframework.http.HttpStatus.CONFLICT);
        }
        teacher.setCategoryIds(next);
        return toResponse(teacherRepository.save(teacher));
    }

    private TeacherResponse toResponse(Teacher teacher) {
        return TeacherMapper.toResponse(teacher, roleCodesOf(teacher.getUser()));
    }

    private List<String> roleCodesOf(User user) {
        if (user == null || user.getRole() == null || user.getRole().getCode() == null) return List.of();
        return List.of(user.getRole().getCode().name());
    }
}
