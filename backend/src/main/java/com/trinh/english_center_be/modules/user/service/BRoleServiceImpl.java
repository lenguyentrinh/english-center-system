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
import com.trinh.english_center_be.modules.user.mapper.RoleMapper;
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
        BusinessRole businessRole = findByIdWithRoles(id);
        if (Boolean.FALSE.equals(businessRole.getActive())) {
            throw new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_DELETED_BY_ID, Constant.BUSINESS_ROLE, id));
        }
        return toResponse(businessRole);
    }

    @Override
    @Transactional
    public BusinessRoleResponse create(BusinessRoleRequest businessRoleRequest) {
        if (bRoleRepository.existsByCode(businessRoleRequest.code())) {
            throw new BusinessException(
                    String.format(MessageConstant.ENTITY_ALREADY_EXISTS, Constant.BUSINESS_ROLE, Constant.CODE_FIELD),
                    HttpStatus.CONFLICT
            );
        }

        BusinessRole businessRole = BusinessRole.builder()
                .code(businessRoleRequest.code())
                .description(businessRoleRequest.description())
                .active(businessRoleRequest.active() != null ? businessRoleRequest.active() : true)
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

        if (bRoleRepository.existsByCodeAndIdNot(businessRoleRequest.code(), id)) {
            throw new BusinessException(
                    String.format(MessageConstant.ENTITY_ALREADY_EXISTS, Constant.BUSINESS_ROLE, Constant.CODE_FIELD),
                    HttpStatus.CONFLICT
            );
        }

        existing.setCode(businessRoleRequest.code());
        existing.setActive(businessRoleRequest.active());
        existing.setDescription(businessRoleRequest.description());

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
                .map(RoleMapper::toResponse)
                .toList();

        return new BusinessRoleResponse(
                businessRole.getId()
                ,businessRole.getCode()
                ,businessRole.getDescription()
                ,businessRole.getActive()
                ,businessRole.getCreatedAt()
                ,businessRole.getUpdateAt()
                ,roles);

    }

    private BusinessRoleResponse toBusinessRoleResponseOverview(BusinessRole businessRole) {
        return new BusinessRoleResponse(
                businessRole.getId()
               ,businessRole.getCode()
               ,businessRole.getDescription()
               ,businessRole.getActive()
               ,businessRole.getCreatedAt()
               ,businessRole.getUpdateAt()
               , List.of()
        );
    }
}

