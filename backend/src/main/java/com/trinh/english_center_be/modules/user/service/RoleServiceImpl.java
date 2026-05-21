package com.trinh.english_center_be.modules.user.service;

import com.trinh.english_center_be.modules.user.Repository.RoleRepository;
import com.trinh.english_center_be.modules.user.dto.RoleRequest;
import com.trinh.english_center_be.modules.user.dto.RoleResponse;
import com.trinh.english_center_be.modules.user.entity.BusinessRole;
import com.trinh.english_center_be.modules.user.entity.Role;
import com.trinh.english_center_be.shared.enums.Roles;
import com.trinh.english_center_be.shared.exception.BusinessException;
import com.trinh.english_center_be.shared.exception.ResourceNotFoundException;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final BRoleService bRoleService;

    @Override
    public Optional<Role> findRoleByRoleName(Roles role) {
        return roleRepository.findByCode(role);
    }

    @Override
    @Transactional
    public void save(Role role) {
        roleRepository.save(role);
    }

    @Override
    public List<RoleResponse> findAll() {
        return roleRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public RoleResponse findById(Long id) {
        Role role = roleRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.ROLE, id))
        );
        if (Boolean.FALSE.equals(role.getActive())) {
            throw new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_DELETED_BY_ID, Constant.ROLE, id));
        }
        return toResponse(role);
    }

    @Override
    @Transactional
    public RoleResponse create(RoleRequest roleRequest) {
        if (roleRepository.existsByCode(roleRequest.getCode())) {
            throw new BusinessException(
                    String.format(MessageConstant.ENTITY_ALREADY_EXISTS, Constant.ROLE, Constant.CODE_FIELD),
                    HttpStatus.CONFLICT
            );
        }

        Role role = Role.builder()
                .code(roleRequest.getCode())
                .description(roleRequest.getDescription())
                .build();

        if (roleRequest.getBusinessRoleId() != null) {
            role.setBusinessRole(resolveActiveBusinessRole(roleRequest.getBusinessRoleId()));
        }

        return toResponse(roleRepository.save(role));
    }

    @Override
    @Transactional
    public void softDeleteById(Long id) {
        Role role = roleRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.ROLE, id))
        );

        role.setActive(false);
        roleRepository.save(role);
    }

    @Override
    @Transactional
    public RoleResponse updateById(Long id, RoleRequest roleRequest) {
        Role existing = roleRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.ROLE, id))
        );

        if (roleRepository.existsByCodeAndIdNot(roleRequest.getCode(), id)) {
            throw new BusinessException(
                    String.format(MessageConstant.ENTITY_ALREADY_EXISTS, Constant.ROLE, Constant.CODE_FIELD),
                    HttpStatus.CONFLICT
            );
        }
        existing.setCode(roleRequest.getCode());
        existing.setDescription(roleRequest.getDescription());

        BusinessRole businessRole = resolveActiveBusinessRole(roleRequest.getBusinessRoleId());
        existing.setBusinessRole(businessRole);

        return toResponse(roleRepository.save(existing));
    }

    private BusinessRole resolveActiveBusinessRole(Long businessRoleId) {
        BusinessRole businessRole = bRoleService.findById(businessRoleId);
        if (Boolean.FALSE.equals(businessRole.getActive())) {
            throw new BusinessException(String.format(MessageConstant.OBJECT_INACTIVE, Constant.BUSINESS_ROLE), HttpStatus.BAD_REQUEST);
        }
        return businessRole;
    }

    private RoleResponse toResponse(Role role) {
        return RoleResponse.builder()
                .id(role.getId())
                .code(role.getCode())
                .description(role.getDescription())
                .active(role.getActive())
                .businessRoleId(role.getBusinessRole() != null ? role.getBusinessRole().getId() : null)
                .businessRoleCode(role.getBusinessRole() != null ? role.getBusinessRole().getCode() : null)
                .build();
    }
}
