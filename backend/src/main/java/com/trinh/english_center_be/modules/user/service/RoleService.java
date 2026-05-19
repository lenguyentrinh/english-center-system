package com.trinh.english_center_be.modules.user.service;

import com.trinh.english_center_be.modules.user.dto.RoleRequest;
import com.trinh.english_center_be.modules.user.dto.RoleResponse;
import com.trinh.english_center_be.modules.user.entity.Role;
import com.trinh.english_center_be.shared.enums.Roles;

import java.util.List;
import java.util.Optional;

public interface RoleService {
    Optional<Role> findRoleByRoleName(Roles role);
    void save(Role role);
    List<RoleResponse> findAll();
    RoleResponse findById(Long id);
    RoleResponse create(RoleRequest roleRequest);
    RoleResponse updateById(Long id, RoleRequest roleRequest);
    void softDeleteById(Long id);
}
