package com.trinh.english_center_be.modules.user.service;

import com.trinh.english_center_be.modules.user.Repository.BRoleRepository;
import com.trinh.english_center_be.modules.user.dto.BusinessRoleRequest;
import com.trinh.english_center_be.modules.user.dto.BusinessRoleResponse;
import com.trinh.english_center_be.modules.user.dto.RoleResponse;
import com.trinh.english_center_be.modules.user.entity.BusinessRole;
import com.trinh.english_center_be.shared.exception.BusinessException;
import com.trinh.english_center_be.shared.exception.ResourceNotFoundException;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BRoleServiceImpl implements BRoleService {

    private final BRoleRepository bRoleRepository;

    @Override
    public List<BusinessRoleResponse> findAll() {
        return bRoleRepository.findAll().stream().map(this::toBusinessRoleResponseOverview).toList();
    }

    @Override
    public BusinessRoleResponse findResponseById(Long id) {
        BusinessRole businessRole = findById(id);
        if (Boolean.FALSE.equals(businessRole.getActive())) {
            throw new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_DELETED_BY_ID, Constant.BUSINESS_ROLE, id));
        }
        return toBusinessRoleResponseOverview(businessRole);
    }

    @Override
    @Transactional
    public BusinessRoleResponse create(BusinessRoleRequest businessRoleRequest) {
        if (bRoleRepository.existsByCode(businessRoleRequest.getCode())) {
            throw new BusinessException(
                    String.format(MessageConstant.ENTITY_ALREADY_EXISTS, Constant.BUSINESS_ROLE, Constant.CODE_FIELD),
                    HttpStatus.CONFLICT
            );
        }

        BusinessRole businessRole = BusinessRole.builder()
                .code(businessRoleRequest.getCode())
                .description(businessRoleRequest.getDescription())
                .active(businessRoleRequest.getActive() != null ? businessRoleRequest.getActive() : true)
                .build();

        return toResponse(bRoleRepository.save(businessRole));
    }

    @Override
    public BusinessRole findById(Long id) {
        return bRoleRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.BUSINESS_ROLE, id))
        );
    }

    @Override
    public BusinessRole findByIdWithRoles(Long id) {
        return bRoleRepository.findByIdWithRoles(id).orElseThrow(
                () -> new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.BUSINESS_ROLE, id))
        );
    }

    @Override
    @Transactional
    public void save(BusinessRole businessRole) {
        bRoleRepository.save(businessRole);
    }

    @Override
    @Transactional
    public BusinessRoleResponse updateById(Long id, BusinessRoleRequest businessRoleRequest) {
        BusinessRole existing = findById(id);

        if (bRoleRepository.existsByCodeAndIdNot(businessRoleRequest.getCode(), id)) {
            throw new BusinessException(
                    String.format(MessageConstant.ENTITY_ALREADY_EXISTS, Constant.BUSINESS_ROLE, Constant.CODE_FIELD),
                    HttpStatus.CONFLICT
            );
        }

        existing.setCode(businessRoleRequest.getCode());
        existing.setActive(businessRoleRequest.getActive());
        existing.setDescription(businessRoleRequest.getDescription());

        return toResponse(bRoleRepository.save(existing));
    }

    @Override
    @Transactional
    public void softDeleteById(Long id) {
        BusinessRole existing = findById(id);
        existing.setActive(false);
        bRoleRepository.save(existing);
    }

    private BusinessRoleResponse toResponse(BusinessRole businessRole) {
        List<RoleResponse> roles = businessRole.getRoles() == null ? List.of() :
                businessRole.getRoles().stream()
                        .filter(r -> Boolean.TRUE.equals(r.getActive()))
                        .map(r -> RoleResponse.builder()
                                .id(r.getId())
                                .code(r.getCode())
                                .description(r.getDescription())
                                .active(r.getActive())
                                .businessRoleId(businessRole.getId())
                                .build())
                        .toList();

        return BusinessRoleResponse.builder()
                .id(businessRole.getId())
                .code(businessRole.getCode())
                .description(businessRole.getDescription())
                .active(businessRole.getActive())
                .roles(roles)
                .createdAt(businessRole.getCreatedAt())
                .updateAt(businessRole.getUpdateAt())
                .build();
    }

    private BusinessRoleResponse toBusinessRoleResponseOverview(BusinessRole businessRole) {
        return BusinessRoleResponse.builder()
                .id(businessRole.getId())
                .code(businessRole.getCode())
                .description(businessRole.getDescription())
                .active(businessRole.getActive())
                .createdAt(businessRole.getCreatedAt())
                .updateAt(businessRole.getUpdateAt())
                .build();
    }
}
