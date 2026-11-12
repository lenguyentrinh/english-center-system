package com.trinh.english_center_be.modules.user.service.impl;

import com.trinh.english_center_be.modules.user.Repository.RoleRepository;
import com.trinh.english_center_be.modules.user.dto.RoleResponse;
import com.trinh.english_center_be.modules.user.entity.Role;
import com.trinh.english_center_be.modules.user.mapper.RoleMapper;
import com.trinh.english_center_be.modules.user.service.RoleService;
import com.trinh.english_center_be.shared.enums.Roles;
import com.trinh.english_center_be.shared.exception.ResourceNotFoundException;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    @Override
    public Role getByCode(Roles code) {
        return roleRepository.findByCode(code).orElseThrow(() ->
                new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.ROLE, code)));
    }

    @Override
    public List<RoleResponse> findAll() {
        return roleRepository.findByActiveTrue().stream().map(RoleMapper::toResponse).toList();
    }
}
