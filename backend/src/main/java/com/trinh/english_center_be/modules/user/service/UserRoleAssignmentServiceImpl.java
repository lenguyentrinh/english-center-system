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
import com.trinh.english_center_be.shared.util.StringUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
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
            throw new BusinessException(String.format(StringUtil.USER_ALREADY_VALUE,StringUtil.ROLE), HttpStatus.CONFLICT);
        }

        User user = userService.findById(userId);
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
            throw new ResourceNotFoundException(String.format(StringUtil.USER_DOES_NOT_VALUE,StringUtil.ROLE));
        }
        userRoleRepository.deleteById(key);
    }

    @Override
    @Transactional
    public void assignBusinessRole(Long userId, Long businessRoleId) {
        if (userBusinessRoleRepository.existsByIdUserIdAndIdBusinessRoleId(userId, businessRoleId)) {
            throw new BusinessException(String.format(StringUtil.USER_ALREADY_VALUE,StringUtil.BUSINESS_ROLE), HttpStatus.CONFLICT);
        }

        User user = userService.findById(userId);
        BusinessRole businessRole = bRoleService.findById(businessRoleId);
        if (Boolean.FALSE.equals(businessRole.getActive())) {
            throw new BusinessException(String.format(StringUtil.OBJECT_INACTIVE, StringUtil.BUSINESS_ROLE), HttpStatus.BAD_REQUEST);
        }

        userBusinessRoleRepository.save(UserBusinessRole.builder()
                .id(new UserBusinessRoleId(userId, businessRoleId))
                .user(user)
                .businessRole(businessRole)
                .build());
    }

    @Override
    @Transactional
    public void removeBusinessRole(Long userId, Long businessRoleId) {
        UserBusinessRoleId key = new UserBusinessRoleId(userId, businessRoleId);
        if (!userBusinessRoleRepository.existsById(key)) {
            throw new ResourceNotFoundException(String.format(StringUtil.USER_DOES_NOT_VALUE,StringUtil.BUSINESS_ROLE));
        }
        userBusinessRoleRepository.deleteById(key);
    }

    @Override
    public UserEffectiveRolesResponse getEffectiveRoles(Long userId) {
        User user = userService.findById(userId);

        Set<RoleResponse> directRoles = userRoleRepository.findByUserIdWithRole(userId).stream()
                .map(ur -> toRoleResponse(ur.getRole()))
                .collect(Collectors.toCollection(LinkedHashSet::new));

        List<UserBusinessRole> userBusinessRoles =
                userBusinessRoleRepository.findByUserIdWithBusinessRoleAndRoles(userId);

        Set<BusinessRoleResponse> businessRoles = userBusinessRoles.stream()
                .map(ubr -> toBusinessRoleResponse(ubr.getBusinessRole()))
                .collect(Collectors.toCollection(LinkedHashSet::new));

        Set<RoleResponse> derivedRoles = userBusinessRoles.stream()
                .flatMap(ubr -> ubr.getBusinessRole().getRoles().stream())
                .filter(r -> Boolean.TRUE.equals(r.getActive()))
                .map(this::toRoleResponse)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        Set<RoleResponse> effectiveRoles = new LinkedHashSet<>(directRoles);
        effectiveRoles.addAll(derivedRoles);

        return UserEffectiveRolesResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .directRoles(directRoles)
                .businessRoles(businessRoles)
                .effectiveRoles(effectiveRoles)
                .build();
    }

    private Role resolveAssignableRole(Long roleId) {
        Role role = roleRepository.findById(roleId).orElseThrow(
                () -> new ResourceNotFoundException(String.format(StringUtil.NOT_FOUND_BY_ID, StringUtil.ROLE, roleId))
        );

        if (Boolean.FALSE.equals(role.getActive())) {
            throw new BusinessException(String.format(StringUtil.OBJECT_INACTIVE, StringUtil.ROLE), HttpStatus.BAD_REQUEST);
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
                .build();
    }

    private BusinessRoleResponse toBusinessRoleResponse(BusinessRole br) {
        Set<RoleResponse> roles = br.getRoles().stream()
                .filter(r -> Boolean.TRUE.equals(r.getActive()))
                .map(this::toRoleResponse)
                .collect(Collectors.toSet());

        return BusinessRoleResponse.builder()
                .id(br.getId())
                .description(br.getDescription())
                .active(br.getActive())
                .roles(roles.stream().toList())
                .createdAt(br.getCreatedAt())
                .updateAt(br.getUpdateAt())
                .build();
    }
}
