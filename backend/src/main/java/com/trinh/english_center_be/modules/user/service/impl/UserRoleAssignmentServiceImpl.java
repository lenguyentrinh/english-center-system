package com.trinh.english_center_be.modules.user.service.impl;

import com.trinh.english_center_be.modules.academic.dto.CourseSuggestionResponse;
import com.trinh.english_center_be.modules.academic.entity.Course;
import com.trinh.english_center_be.modules.academic.mapper.CourseMapper;
import com.trinh.english_center_be.modules.academic.repository.CourseRepository;
import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import com.trinh.english_center_be.modules.teacher.repository.TeacherRepository;
import com.trinh.english_center_be.modules.user.Repository.BRoleRepository;
import com.trinh.english_center_be.modules.user.Repository.RoleRepository;
import com.trinh.english_center_be.modules.user.Repository.UserBusinessRoleRepository;
import com.trinh.english_center_be.modules.user.Repository.UserRepository;
import com.trinh.english_center_be.modules.user.Repository.UserRoleRepository;
import com.trinh.english_center_be.modules.user.dto.BusinessRoleResponse;
import com.trinh.english_center_be.modules.user.dto.RoleResponse;
import com.trinh.english_center_be.modules.user.dto.UserEffectiveRolesResponse;
import com.trinh.english_center_be.modules.user.entity.BusinessRole;
import com.trinh.english_center_be.modules.user.entity.Role;
import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.modules.user.entity.UserBusinessRole;
import com.trinh.english_center_be.modules.user.entity.UserRole;
import com.trinh.english_center_be.modules.user.mapper.BusinessRoleMapper;
import com.trinh.english_center_be.modules.user.mapper.RoleMapper;
import com.trinh.english_center_be.modules.user.mapper.UserMapper;
import com.trinh.english_center_be.modules.user.service.BRoleService;
import com.trinh.english_center_be.modules.user.service.UserRoleAssignmentService;
import com.trinh.english_center_be.modules.user.service.UserService;
import com.trinh.english_center_be.shared.enums.Roles;
import com.trinh.english_center_be.shared.exception.BusinessException;
import com.trinh.english_center_be.shared.exception.ResourceNotFoundException;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserRoleAssignmentServiceImpl implements UserRoleAssignmentService {

    private final UserRoleRepository userRoleRepository;
    private final UserBusinessRoleRepository userBusinessRoleRepository;
    private final RoleRepository roleRepository;
    private final BRoleRepository bRoleRepository;
    private final BRoleService bRoleService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;

    @Override
    public void assignRole(String userId, String roleId) {
        if (userRoleRepository.existsByUserIdAndRoleId(userId, roleId)) {
            throw new BusinessException(String.format(MessageConstant.USER_ALREADY_VALUE, Constant.ROLE), HttpStatus.CONFLICT);
        }

        User user = userService.findById(userId);
        if (!user.getActive()) {
            throw new ResourceNotFoundException(String.format(MessageConstant.ENTITY_INACTIVE_CAN_NOT_ASSIGN, Constant.USER));
        }

        Role role = resolveAssignableRole(roleId);

        userRoleRepository.save(UserRole.builder()
                .userId(user.getId())
                .roleId(role.getId())
                .build());

        // If assigned role is a teacher role, ensure Teacher entity exists
        if (isTeacherRole(role.getCode())) {
            createTeacherIfNotExists(user);
        }
    }

    @Override
    public void removeRole(String userId, String roleId) {
        UserRole link = userRoleRepository.findByUserIdAndRoleId(userId, roleId)
                .orElseThrow(() -> new ResourceNotFoundException(String.format(MessageConstant.USER_DOES_NOT_VALUE, Constant.ROLE)));
        userRoleRepository.delete(link);

        // If removed role is a teacher role and user no longer has any teacher roles, delete teacher record
        roleRepository.findById(roleId).ifPresent(role -> {
            if (isTeacherRole(role.getCode())) {
                deleteTeacherIfNoTeacherRoles(userId, role.getCode());
            }
        });
    }

    @Override
    public List<CourseSuggestionResponse> assignBusinessRole(String userId, String businessRoleId) {
        if (userBusinessRoleRepository.existsByUserIdAndBusinessRoleId(userId, businessRoleId)) {
            throw new BusinessException(
                    String.format(MessageConstant.USER_ALREADY_VALUE, Constant.BUSINESS_ROLE),
                    HttpStatus.CONFLICT
            );
        }

        User user = userService.findById(userId);
        if (!user.getActive()) {
            throw new ResourceNotFoundException(String.format(MessageConstant.ENTITY_INACTIVE_CAN_NOT_ASSIGN, Constant.USER));
        }

        BusinessRole businessRole = bRoleService.findById(businessRoleId);
        if (Boolean.FALSE.equals(businessRole.getActive())) {
            throw new BusinessException(String.format(MessageConstant.ENTITY_INACTIVE_CAN_NOT_ASSIGN, Constant.BUSINESS_ROLE), HttpStatus.BAD_REQUEST);
        }

        // Assign the business role to user
        userBusinessRoleRepository.save(UserBusinessRole.builder()
                .userId(userId)
                .businessRoleId(businessRoleId)
                .build());

        List<Role> roles = roleRepository.findByBusinessRole(businessRole);
        ensureUserRolesForBusinessRole(user, roles);

        // If any of the roles in the business role is a teacher role, ensure Teacher entity exists
        if (roles.stream().map(Role::getCode).anyMatch(this::isTeacherRole)) {
            createTeacherIfNotExists(user);
        }

        // After assigning roles, suggest matching courses (courses with matching availableRoleTeacher and no teacher assigned)
        List<Roles> roleCodes = roles.stream()
                .map(Role::getCode)
                .filter(Objects::nonNull)
                .toList();
        if (roleCodes.isEmpty()) {
            return List.of();
        }
        return courseRepository.findByAvailableRoleTeacherInAndTeacherIsNull(roleCodes).stream()
                .map(CourseMapper::toSuggestion)
                .toList();
    }

    @Override
    public void removeBusinessRole(String userId, String businessRoleId) {
        UserBusinessRole link = userBusinessRoleRepository.findByUserIdAndBusinessRoleId(userId, businessRoleId)
                .orElseThrow(() -> new ResourceNotFoundException(String.format(MessageConstant.USER_DOES_NOT_VALUE, Constant.BUSINESS_ROLE)));

        BusinessRole businessRole = bRoleService.findById(businessRoleId);
        List<Role> roles = roleRepository.findByBusinessRole(businessRole);

        userBusinessRoleRepository.delete(link);
        removeUserRolesExclusiveToBusinessRole(userId, businessRoleId, roles);

        // After removing business role and related roles, if user no longer has any teacher roles remove Teacher
        Roles[] removedRoleCodes = roles.stream()
                .map(Role::getCode)
                .filter(this::isTeacherRole)
                .toArray(Roles[]::new);

        deleteTeacherIfNoTeacherRoles(userId, removedRoleCodes);
    }

    @Override
    public UserEffectiveRolesResponse getEffectiveRoles(String userId) {
        User user = userService.findById(userId);

        List<BusinessRole> assignedBusinessRoles = findAssignedBusinessRoles(userId);
        Set<String> assignedBusinessRoleIds = assignedBusinessRoles.stream()
                .map(BusinessRole::getId)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        List<Role> userRoles = findDirectRoles(userId);

        Map<String, Set<RoleResponse>> rolesByBusinessRoleId = new HashMap<>();
        Set<RoleResponse> directRoles = new LinkedHashSet<>();
        Set<RoleResponse> effectiveRoles = new LinkedHashSet<>();

        for (Role role : userRoles) {
            RoleResponse roleResponse = RoleMapper.toResponse(role);
            effectiveRoles.add(roleResponse);

            BusinessRole businessRole = role.getBusinessRole();
            if (businessRole != null && assignedBusinessRoleIds.contains(businessRole.getId())) {
                rolesByBusinessRoleId
                        .computeIfAbsent(businessRole.getId(), ignored -> new LinkedHashSet<>())
                        .add(roleResponse);
            } else {
                directRoles.add(roleResponse);
            }
        }

        Set<BusinessRoleResponse> businessRoles = assignedBusinessRoles.stream()
                .map(br -> BusinessRoleMapper.toResponseWithAssignedRoles(
                        br,
                        rolesByBusinessRoleId.getOrDefault(br.getId(), Set.of())
                ))
                .collect(Collectors.toCollection(LinkedHashSet::new));

        return UserMapper.toEffectiveRoles(
                user,
                directRoles,
                businessRoles,
                effectiveRoles
        );
    }

    // Helper methods

    private boolean isTeacherRole(Roles code) {
        return code != null && code.name().startsWith("TEACHER");
    }

    /** Business roles currently assigned to the user (ids resolved to documents). */
    private List<BusinessRole> findAssignedBusinessRoles(String userId) {
        List<String> ids = userBusinessRoleRepository.findByUserId(userId).stream()
                .map(UserBusinessRole::getBusinessRoleId)
                .toList();
        return ids.isEmpty() ? List.of() : bRoleRepository.findAllById(ids);
    }

    /** Roles directly assigned to the user through user_roles (ids resolved to documents). */
    private List<Role> findDirectRoles(String userId) {
        List<String> ids = userRoleRepository.findByUserId(userId).stream()
                .map(UserRole::getRoleId)
                .toList();
        return ids.isEmpty() ? List.of() : roleRepository.findAllById(ids);
    }

    private void ensureUserRolesForBusinessRole(User user, List<Role> roles) {
        // For each role in the business role, if user doesn't have it yet, assign it
        for (Role role : roles) {
            if (!Boolean.TRUE.equals(role.getActive())) {
                continue;
            }
            if (userRoleRepository.existsByUserIdAndRoleId(user.getId(), role.getId())) {
                continue;
            }
            userRoleRepository.save(UserRole.builder()
                    .userId(user.getId())
                    .roleId(role.getId())
                    .build());
        }
    }

    private void removeUserRolesExclusiveToBusinessRole(String userId, String businessRoleId, List<Role> roles) {
        if (roles.isEmpty()) {
            return;
        }

        List<String> otherBusinessRoleIds = userBusinessRoleRepository.findByUserId(userId).stream()
                .map(UserBusinessRole::getBusinessRoleId)
                .filter(id -> !businessRoleId.equals(id))
                .toList();

        Set<String> roleIdsKeptByOtherBusinessRoles = otherBusinessRoleIds.isEmpty() ? Set.of() :
                bRoleRepository.findAllById(otherBusinessRoleIds).stream()
                        .flatMap(other -> roleRepository.findByBusinessRole(other).stream())
                        .map(Role::getId)
                        .collect(Collectors.toSet());

        for (Role role : roles) {
            if (roleIdsKeptByOtherBusinessRoles.contains(role.getId())) {
                continue;
            }
            userRoleRepository.findByUserIdAndRoleId(userId, role.getId())
                    .ifPresent(link -> userRoleRepository.delete(link));
        }
    }

    private Role resolveAssignableRole(String roleId) {
        Role role = roleRepository.findById(roleId).orElseThrow(
                () -> new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.ROLE, roleId))
        );

        if (Boolean.FALSE.equals(role.getActive())) {
            throw new BusinessException(String.format(MessageConstant.ENTITY_INACTIVE_CAN_NOT_ASSIGN, Constant.ROLE), HttpStatus.BAD_REQUEST);
        }
        return role;
    }

    private void createTeacherIfNotExists(User user) {
        if (teacherRepository.findByUser(user).isPresent()) return;
        Teacher t = Teacher.builder().user(user).build();
        teacherRepository.save(t);
    }

    private Optional<Teacher> findTeacherByUserId(String userId) {
        return userRepository.findById(userId).flatMap(teacherRepository::findByUser);
    }

    private void deleteTeacherIfNoTeacherRoles(String userId, Roles... removedRoleCodes) {
        Optional<Teacher> maybeTeacher = findTeacherByUserId(userId);
        if (maybeTeacher.isEmpty()) return;
        Teacher teacher = maybeTeacher.get();

        boolean hasTeacherDirect = findDirectRoles(userId).stream()
                .map(Role::getCode)
                .anyMatch(this::isTeacherRole);

        // Check roles coming from assigned business roles (all roles of all assigned business roles)
        boolean hasTeacherViaBusiness = findAssignedBusinessRoles(userId).stream()
                .flatMap(br -> roleRepository.findByBusinessRole(br).stream())
                .map(Role::getCode)
                .anyMatch(this::isTeacherRole);

        List<Roles> removed = removedRoleCodes == null ? List.of() :
                Arrays.stream(removedRoleCodes).filter(Objects::nonNull).toList();

        // If no teacher roles remain at all: unassign all courses and delete teacher
        if (!hasTeacherDirect && !hasTeacherViaBusiness) {
            List<Course> assignedCourses = courseRepository.findByTeacher(teacher);
            if (!assignedCourses.isEmpty()) {
                assignedCourses.forEach(c -> c.setTeacher(null));
                courseRepository.saveAll(assignedCourses);
            }
            teacherRepository.delete(teacher);
            return;
        }

        // Otherwise, if some roles were removed, unassign only matching courses
        if (!removed.isEmpty()) {
            List<Course> toUnassign = courseRepository.findByTeacherAndAvailableRoleTeacherIn(teacher, removed);
            if (!toUnassign.isEmpty()) {
                toUnassign.forEach(c -> c.setTeacher(null));
                courseRepository.saveAll(toUnassign);
            }
        }
    }
}
