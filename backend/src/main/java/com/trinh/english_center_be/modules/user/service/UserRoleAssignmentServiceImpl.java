package com.trinh.english_center_be.modules.user.service;

import com.trinh.english_center_be.modules.academic.dto.CourseSuggestionResponse;
import com.trinh.english_center_be.modules.academic.entity.Course;
import com.trinh.english_center_be.modules.academic.repository.CourseRepository;
import com.trinh.english_center_be.modules.user.Repository.RoleRepository;
import com.trinh.english_center_be.modules.user.Repository.UserBusinessRoleRepository;
import com.trinh.english_center_be.modules.user.Repository.UserRoleRepository;
import com.trinh.english_center_be.modules.user.dto.BusinessRoleResponse;
import com.trinh.english_center_be.modules.user.dto.RoleResponse;
import com.trinh.english_center_be.modules.user.dto.UserEffectiveRolesResponse;
import com.trinh.english_center_be.modules.user.entity.*;
import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import com.trinh.english_center_be.modules.teacher.repository.TeacherRepository;
import com.trinh.english_center_be.modules.user.mapper.RoleMapper;
import com.trinh.english_center_be.shared.enums.Roles;
import com.trinh.english_center_be.shared.exception.BusinessException;
import com.trinh.english_center_be.shared.exception.ResourceNotFoundException;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserRoleAssignmentServiceImpl implements UserRoleAssignmentService {

    private final UserRoleRepository userRoleRepository;
    private final UserBusinessRoleRepository userBusinessRoleRepository;
    private final RoleRepository roleRepository;
    private final BRoleService bRoleService;
    private final UserService userService;
    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;

    @Override
    @Transactional
    public void assignRole(Long userId, Long roleId) {
        if (userRoleRepository.existsByIdUserIdAndIdRoleId(userId, roleId)) {
            throw new BusinessException(String.format(MessageConstant.USER_ALREADY_VALUE, Constant.ROLE), HttpStatus.CONFLICT);
        }

        User user = userService.findById(userId);
        if (!user.getActive()) {
            throw new ResourceNotFoundException(String.format(MessageConstant.ENTITY_INACTIVE_CAN_NOT_ASSIGN, Constant.USER));
        }

        Role role = resolveAssignableRole(roleId);

        userRoleRepository.save(UserRole.builder()
                .id(new UserRoleId(user.getId(), roleId))
                .user(user)
                .role(role)
                .build());

        // If assigned role is a teacher role, ensure Teacher entity exists
        if (role.getCode() != null && role.getCode().name().startsWith("TEACHER")) {
            createTeacherIfNotExists(user);
        }
    }

    @Override
    @Transactional
    public void removeRole(Long userId, Long roleId) {
        UserRoleId key = new UserRoleId(userId, roleId);
        if (!userRoleRepository.existsById(key)) {
            throw new ResourceNotFoundException(String.format(MessageConstant.USER_DOES_NOT_VALUE, Constant.ROLE));
        }
        userRoleRepository.deleteById(key);
        // If removed role is a teacher role and user no longer has any teacher roles, delete teacher record
        roleRepository.findById(roleId).ifPresent(role -> {
            if (role.getCode() != null && role.getCode().name().startsWith("TEACHER")) {
                deleteTeacherIfNoTeacherRoles(userId, role.getCode());
            }
        });
    }

    @Override
    @Transactional
    public List<CourseSuggestionResponse> assignBusinessRole(Long userId, Long businessRoleId) {
        if (userBusinessRoleRepository.existsByIdUserIdAndIdBusinessRoleId(userId, businessRoleId)) {
            throw new BusinessException(
                    String.format(MessageConstant.USER_ALREADY_VALUE, Constant.BUSINESS_ROLE),
                    HttpStatus.CONFLICT
            );
        }

        User user = userService.findById(userId);
        if (!user.getActive()) {
            throw new ResourceNotFoundException(String.format(MessageConstant.ENTITY_INACTIVE_CAN_NOT_ASSIGN, Constant.USER));
        }

        BusinessRole businessRole = bRoleService.findByIdWithRoles(businessRoleId);
        if (Boolean.FALSE.equals(businessRole.getActive())) {
            throw new BusinessException(String.format(MessageConstant.ENTITY_INACTIVE_CAN_NOT_ASSIGN, Constant.BUSINESS_ROLE), HttpStatus.BAD_REQUEST);
        }

        // Assign the business role to user
        userBusinessRoleRepository.save(UserBusinessRole.builder()
                .id(new UserBusinessRoleId(userId, businessRoleId))
                .user(user)
                .businessRole(businessRole)
                .build());
        ensureUserRolesForBusinessRole(user, businessRole);

        // If any of the roles in the business role is a teacher role, ensure Teacher entity exists
        if (businessRole.getRoles() != null) {
            boolean hasTeacher = businessRole.getRoles().stream()
                    .filter(Objects::nonNull)
                    .map(Role::getCode)
                    .filter(Objects::nonNull)
                    .anyMatch(rc -> rc.name().startsWith("TEACHER"));
            if (hasTeacher) {
                createTeacherIfNotExists(user);
            }
        }

        // After assigning roles, suggest matching courses (courses with matching availableRoleTeacher and no teacher assigned)
        List<CourseSuggestionResponse> suggestions = new ArrayList<>();
        if (businessRole.getRoles() != null && !businessRole.getRoles().isEmpty()) {
            List<Roles> roleCodes = businessRole.getRoles().stream()
                    .filter(Objects::nonNull)
                    .map(Role::getCode)
                    .filter(Objects::nonNull)
                    .toList();

            if (!roleCodes.isEmpty()) {
                suggestions = courseRepository.findByAvailableRoleTeacherInAndTeacherIsNull(roleCodes).stream()
                        .map(c -> new CourseSuggestionResponse(c.getId(), c.getCode(), c.getName(), c.getAvailableRoleTeacher()))
                        .toList();
            }
        }

        return suggestions;
    }

    @Override
    @Transactional
    public void removeBusinessRole(Long userId, Long businessRoleId) {
        UserBusinessRoleId key = new UserBusinessRoleId(userId, businessRoleId);
        if (!userBusinessRoleRepository.existsById(key)) {
            throw new ResourceNotFoundException(String.format(MessageConstant.USER_DOES_NOT_VALUE, Constant.BUSINESS_ROLE));
        }

        BusinessRole businessRole = bRoleService.findByIdWithRoles(businessRoleId);
        userBusinessRoleRepository.deleteById(key);
        removeUserRolesExclusiveToBusinessRole(userId, businessRoleId, businessRole);
        // After removing business role and related roles, if user no longer has any teacher roles remove Teacher
        // collect removed teacher role codes from this business role
        Roles[] removedRoleCodes = Optional.ofNullable(businessRole.getRoles()).orElse(Collections.emptySet()).stream()
            .filter(Objects::nonNull)
            .map(Role::getCode)
            .filter(Objects::nonNull)
            .filter(rc -> rc.name().startsWith("TEACHER"))
            .toArray(Roles[]::new);

        deleteTeacherIfNoTeacherRoles(userId, removedRoleCodes);
    }

    @Override
    public UserEffectiveRolesResponse getEffectiveRoles(Long userId) {
        User user = userService.findById(userId);

        List<UserBusinessRole> userBusinessRoles =
                userBusinessRoleRepository.findByUserIdWithBusinessRoleAndRoles(userId);

        Set<Long> assignedBusinessRoleIds = userBusinessRoles.stream()
                .map(ubr -> ubr.getBusinessRole().getId())
                .collect(Collectors.toCollection(LinkedHashSet::new));

        List<UserRole> userRoles = userRoleRepository.findByUserIdWithRoleAndBusinessRole(userId);

        Map<Long, Set<RoleResponse>> rolesByBusinessRoleId = new HashMap<>();
        Set<RoleResponse> directRoles = new LinkedHashSet<>();
        Set<RoleResponse> effectiveRoles = new LinkedHashSet<>();

        for (UserRole userRole : userRoles) {
            RoleResponse roleResponse = RoleMapper.toResponse(userRole.getRole());
            effectiveRoles.add(roleResponse);

            BusinessRole businessRole = userRole.getRole().getBusinessRole();
            if (businessRole != null && assignedBusinessRoleIds.contains(businessRole.getId())) {
                rolesByBusinessRoleId
                        .computeIfAbsent(businessRole.getId(), ignored -> new LinkedHashSet<>())
                        .add(roleResponse);
            } else {
                directRoles.add(roleResponse);
            }
        }

        Set<BusinessRoleResponse> businessRoles = userBusinessRoles.stream()
                .map(ubr -> toBusinessRoleResponse(
                        ubr.getBusinessRole(),
                        rolesByBusinessRoleId.getOrDefault(ubr.getBusinessRole().getId(), Set.of())
                ))
                .collect(Collectors.toCollection(LinkedHashSet::new));

        return UserEffectiveRolesResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .directRoles(directRoles)
                .businessRoles(businessRoles)
                .effectiveRoles(effectiveRoles)
                .build();
    }

    // Helper methods
    private void ensureUserRolesForBusinessRole(User user, BusinessRole businessRole) {
        if (businessRole.getRoles() == null) {
            return;
        }

        // For each role in the business role, if user doesn't have it yet, assign it
        for (Role role : businessRole.getRoles()) {
            if (!Boolean.TRUE.equals(role.getActive())) {
                continue;
            }
            Long roleId = role.getId();
            if (userRoleRepository.existsByIdUserIdAndIdRoleId(user.getId(), roleId)) {
                continue;
            }
            userRoleRepository.save(UserRole.builder()
                    .id(new UserRoleId(user.getId(), roleId))
                    .user(user)
                    .role(role)
                    .build());
        }
    }

    private void removeUserRolesExclusiveToBusinessRole(Long userId, Long businessRoleId, BusinessRole businessRole) {
        if (businessRole.getRoles() == null || businessRole.getRoles().isEmpty()) {
            return;
        }

        Set<Long> roleIdsKeptByOtherBusinessRoles = userBusinessRoleRepository
                .findByUserIdWithBusinessRoleAndRoles(userId).stream()
                .filter(ubr -> !businessRoleId.equals(ubr.getBusinessRole().getId()))
                .flatMap(ubr -> ubr.getBusinessRole().getRoles().stream())
                .map(Role::getId)
                .collect(Collectors.toSet());

        for (Role role : businessRole.getRoles()) {
            Long roleId = role.getId();
            if (roleIdsKeptByOtherBusinessRoles.contains(roleId)) {
                continue;
            }
            UserRoleId key = new UserRoleId(userId, roleId);
            if (userRoleRepository.existsById(key)) {
                userRoleRepository.deleteById(key);
            }
        }
    }

    private Role resolveAssignableRole(Long roleId) {
        Role role = roleRepository.findById(roleId).orElseThrow(
                () -> new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.ROLE, roleId))
        );

        if (Boolean.FALSE.equals(role.getActive())) {
            throw new BusinessException(String.format(MessageConstant.ENTITY_INACTIVE_CAN_NOT_ASSIGN, Constant.ROLE), HttpStatus.BAD_REQUEST);
        }
        return role;
    }

    

    private BusinessRoleResponse toBusinessRoleResponse(BusinessRole businessRole, Set<RoleResponse> assignedRoles) {
        return new BusinessRoleResponse(
                businessRole.getId()
                ,businessRole.getCode()
                ,businessRole.getDescription()
                ,businessRole.getActive()
                ,businessRole.getCreatedAt()
                ,businessRole.getUpdateAt()
                ,assignedRoles.stream().toList()
        );
    }

    private void createTeacherIfNotExists(User user) {
        if (teacherRepository.findByUserId(user.getId()).isPresent()) return;
        Teacher t = Teacher.builder().user(user).build();
        teacherRepository.save(t);
    }

    private void deleteTeacherIfNoTeacherRoles(Long userId, Roles... removedRoleCodes) {
        List<UserRole> remainingUserRoles = userRoleRepository.findByUserIdWithRoleAndBusinessRole(userId);
        boolean hasTeacherDirect = remainingUserRoles.stream()
                .map(UserRole::getRole)
                .filter(Objects::nonNull)
                .map(Role::getCode)
                .filter(Objects::nonNull)
                .anyMatch(rc -> rc.name().startsWith("TEACHER"));

        // Check roles coming from assigned business roles
        // flatMap to get all roles from all assigned business roles
        // example: if user has 2 business roles, each with 3 roles, we get a stream of 6 roles to check
        // if among those 6 roles one has code "TEACHER_ENGLISH", the anyMatch will return true
        // stream flatMap example: [BR1->RoleA, RoleB, RoleC], [BR2->RoleD, RoleE, RoleF]
        //   --> flatMap --> RoleA, RoleB, RoleC, RoleD, RoleE, RoleF
        boolean hasTeacherViaBusiness = userBusinessRoleRepository.findByUserIdWithBusinessRoleAndRoles(userId).stream()
            .flatMap(ubr -> ubr.getBusinessRole().getRoles().stream())
            .filter(Objects::nonNull)
            .map(Role::getCode)
            .filter(Objects::nonNull)
            .anyMatch(rc -> rc.name().startsWith("TEACHER"));

        var maybeTeacher = teacherRepository.findByUserId(userId);
        if (maybeTeacher.isEmpty()) return;
        var teacher = maybeTeacher.get();

        List<Roles> removed = removedRoleCodes == null || removedRoleCodes.length == 0 ? List.of() : Arrays.asList(removedRoleCodes);

        // If no teacher roles remain at all: unassign all courses and delete teacher
        if (!hasTeacherDirect && !hasTeacherViaBusiness) {
            List<Course> assignedCourses = courseRepository.findByTeacherUserId(userId);
            if (!assignedCourses.isEmpty()) {
                assignedCourses.forEach(c -> c.setTeacher(null));
                courseRepository.saveAll(assignedCourses);
            }
            teacherRepository.delete(teacher);
            return;
        }

        // Otherwise, if some roles were removed, unassign only matching courses using a DB query
        if (!removed.isEmpty()) {
            List<Course> toUnassign = courseRepository.findByTeacherUserIdAndAvailableRoleTeacherIn(userId, removed);
            if (!toUnassign.isEmpty()) {
                toUnassign.forEach(c -> c.setTeacher(null));
                courseRepository.saveAll(toUnassign);
            }
        }
    }
}