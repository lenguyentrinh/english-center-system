package com.trinh.english_center_be.modules.teacher.service.impl;

import com.trinh.english_center_be.modules.teacher.dto.TeacherResponse;
import com.trinh.english_center_be.modules.teacher.dto.TeacherUpsertRequest;
import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import com.trinh.english_center_be.modules.teacher.mapper.TeacherMapper;
import com.trinh.english_center_be.modules.teacher.repository.TeacherRepository;
import com.trinh.english_center_be.modules.teacher.service.TeacherService;
import com.trinh.english_center_be.modules.user.Repository.RoleRepository;
import com.trinh.english_center_be.modules.user.Repository.UserRepository;
import com.trinh.english_center_be.modules.user.Repository.UserRoleRepository;
import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.modules.user.entity.UserRole;
import com.trinh.english_center_be.modules.user.service.UserService;
import com.trinh.english_center_be.shared.enums.Roles;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TeacherServiceImpl implements TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserService userService;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;

    @Override
    // find all teacher has the compatible role or get the all teachers without role
    public List<TeacherResponse> findTeachers(String role) {
        if (role == null || role.isBlank()) {
            // return all teacher
            return teacherRepository.findAll().stream().map(TeacherMapper::toResponse).collect(Collectors.toList());
        }

        Roles roleEnum = Roles.valueOf(role);
        List<String> userIds = findUserIdsByRoleCode(roleEnum);
        if (userIds.isEmpty()) {
            return List.of();
        }

        List<User> users = userRepository.findAllById(userIds);
        return teacherRepository.findByUserIn(users).stream().map(TeacherMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public Optional<TeacherResponse> findById(String id) {
        return teacherRepository.findById(id).map(TeacherMapper::toResponse);
    }

    @Override
    public Optional<TeacherResponse> findByUserId(String userId) {
        return userRepository.findById(userId)
                .flatMap(teacherRepository::findByUser)
                .map(TeacherMapper::toResponse);
    }

    @Override
    public TeacherResponse upsertByUserId(String userId, TeacherUpsertRequest request) {
        User user = userService.findById(userId);
        Teacher t = teacherRepository.findByUser(user).orElseGet(() -> Teacher.builder().user(user).build());
        t.setSalary(request.salary());
        Teacher saved = teacherRepository.save(t);
        return TeacherMapper.toResponse(saved);
    }

    private List<String> findUserIdsByRoleCode(Roles code) {
        return roleRepository.findByCode(code)
                .map(role -> userRoleRepository.findByRoleId(role.getId()).stream()
                        .map(UserRole::getUserId)
                        .toList())
                .orElse(List.of());
    }
}
