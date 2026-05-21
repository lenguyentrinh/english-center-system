package com.trinh.english_center_be.modules.user.service;

import com.trinh.english_center_be.modules.user.Repository.RoleRepository;
import com.trinh.english_center_be.modules.user.Repository.UserBusinessRoleRepository;
import com.trinh.english_center_be.modules.user.Repository.UserRoleRepository;
import com.trinh.english_center_be.modules.user.dto.BusinessRoleResponse;
import com.trinh.english_center_be.modules.user.dto.RoleResponse;
import com.trinh.english_center_be.modules.user.dto.UserEffectiveRolesResponse;
import com.trinh.english_center_be.modules.user.entity.*;
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
                .id(new UserRoleId(userId, roleId))
                .user(user)
                .role(role)
                .build());
    }

    @Override
    @Transactional
    public void removeRole(Long userId, Long roleId) {
        UserRoleId key = new UserRoleId(userId, roleId);
        if (!userRoleRepository.existsById(key)) {
            throw new ResourceNotFoundException(String.format(MessageConstant.USER_DOES_NOT_VALUE, Constant.ROLE));
        }
        userRoleRepository.deleteById(key);
    }

    @Override
    @Transactional
    public void assignBusinessRole(Long userId, Long businessRoleId) {
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

        userBusinessRoleRepository.save(UserBusinessRole.builder()
                .id(new UserBusinessRoleId(userId, businessRoleId))
                .user(user)
                .businessRole(businessRole)
                .build());

        ensureUserRolesForBusinessRole(user, businessRole);
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
            RoleResponse roleResponse = toRoleResponse(userRole.getRole());
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

    private void ensureUserRolesForBusinessRole(User user, BusinessRole businessRole) {
        if (businessRole.getRoles() == null) {
            return;
        }

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

    private RoleResponse toRoleResponse(Role role) {
        return RoleResponse.builder()
                .id(role.getId())
                .code(role.getCode())
                .description(role.getDescription())
                .active(role.getActive())
                .businessRoleId(role.getBusinessRole() != null ? role.getBusinessRole().getId() : null)
                .businessRoleCode(role.getBusinessRole() != null ?role.getBusinessRole().getCode() : null)
                .build();
    }

    private BusinessRoleResponse toBusinessRoleResponse(BusinessRole businessRole, Set<RoleResponse> assignedRoles) {
        return BusinessRoleResponse.builder()
                .id(businessRole.getId())
                .code(businessRole.getCode())
                .description(businessRole.getDescription())
                .active(businessRole.getActive())
                .roles(assignedRoles.stream().toList())
                .createdAt(businessRole.getCreatedAt())
                .updateAt(businessRole.getUpdateAt())
                .build();
    }
}