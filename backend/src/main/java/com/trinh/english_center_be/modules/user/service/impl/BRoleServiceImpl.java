package com.trinh.english_center_be.modules.user.service.impl;

import com.trinh.english_center_be.modules.user.Repository.BRoleRepository;
import com.trinh.english_center_be.modules.user.Repository.RoleRepository;
import com.trinh.english_center_be.modules.user.dto.BusinessRoleRequest;
import com.trinh.english_center_be.modules.user.dto.BusinessRoleResponse;
import com.trinh.english_center_be.modules.user.entity.BusinessRole;
import com.trinh.english_center_be.modules.user.mapper.BusinessRoleMapper;
import com.trinh.english_center_be.modules.user.service.BRoleService;
import com.trinh.english_center_be.shared.exception.BusinessException;
import com.trinh.english_center_be.shared.exception.ResourceNotFoundException;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BRoleServiceImpl implements BRoleService {

    private final BRoleRepository bRoleRepository;
    private final RoleRepository roleRepository;

    @Override
    public List<BusinessRoleResponse> findAll() {
        return bRoleRepository.findAll().stream().map(BusinessRoleMapper::toOverview).toList();
    }

    @Override
    public BusinessRoleResponse findResponseById(String id) {
        BusinessRole businessRole = findById(id);
        if (Boolean.FALSE.equals(businessRole.getActive())) {
            throw new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_DELETED_BY_ID, Constant.BUSINESS_ROLE, id));
        }
        return BusinessRoleMapper.toResponse(businessRole, roleRepository.findByBusinessRole(businessRole));
    }

    @Override
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

        return BusinessRoleMapper.toResponse(bRoleRepository.save(businessRole), List.of());
    }

    @Override
    public BusinessRole findById(String id) {
        return bRoleRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.BUSINESS_ROLE, id))
        );
    }

    @Override
    public void save(BusinessRole businessRole) {
        bRoleRepository.save(businessRole);
    }

    @Override
    public BusinessRoleResponse updateById(String id, BusinessRoleRequest businessRoleRequest) {
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

        BusinessRole saved = bRoleRepository.save(existing);
        return BusinessRoleMapper.toResponse(saved, roleRepository.findByBusinessRole(saved));
    }

    @Override
    public void softDeleteById(String id) {
        BusinessRole existing = findById(id);
        existing.setActive(false);
        bRoleRepository.save(existing);
    }
}
