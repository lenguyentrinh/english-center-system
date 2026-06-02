package com.trinh.english_center_be.modules.teacher.service;

import com.trinh.english_center_be.modules.teacher.dto.TeacherResponse;
import com.trinh.english_center_be.modules.teacher.dto.TeacherUpsertRequest;
import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import com.trinh.english_center_be.modules.teacher.repository.TeacherRepository;
import com.trinh.english_center_be.modules.user.Repository.UserRoleRepository;
import com.trinh.english_center_be.modules.user.service.UserService;
import com.trinh.english_center_be.shared.enums.Roles;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TeacherServiceImpl implements TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserService userService;
    private final UserRoleRepository userRoleRepository;

    @Override
    @Transactional(readOnly = true)
    //find all teacher has the compatible role or get the all teachers without role
    public List<TeacherResponse> findTeachers(String role) {
        if (role == null || role.isBlank()) {
            // return all teacher
            return teacherRepository.findAllWithUser().stream().map(this::toResponse).collect(Collectors.toList());
        }

        Roles roleEnum = Roles.valueOf(role);
        List<Long> userIds = userRoleRepository.findUserIdsByRoleCode(roleEnum);
        if (userIds == null || userIds.isEmpty()) {
            return List.of();
        }

        return teacherRepository.findByUserIdInWithUser(userIds).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<TeacherResponse> findById(Long id) {
        return teacherRepository.findByIdWithUser(id).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<TeacherResponse> findByUserId(Long userId) {
        return teacherRepository.findByUserIdWithUser(userId).map(this::toResponse);
    }

    @Override
    @Transactional
    public TeacherResponse upsertByUserId(Long userId, TeacherUpsertRequest request) {
        var user = userService.findById(userId);
        Teacher t = teacherRepository.findByUserId(userId).orElseGet(() -> Teacher.builder().user(user).build());
        t.setSalary(request.salary());
        Teacher saved = teacherRepository.save(t);
        return toResponse(saved);
    }

    private TeacherResponse toResponse(Teacher t) {
        String fullName = t.getUser() != null ? t.getUser().getFullName() : null;
        BigDecimal salary = t.getSalary();
        return new TeacherResponse(t.getId(), fullName, salary);
    }
}
