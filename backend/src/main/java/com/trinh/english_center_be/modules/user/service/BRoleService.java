package com.trinh.english_center_be.modules.user.service;

import com.trinh.english_center_be.modules.user.dto.BusinessRoleRequest;
import com.trinh.english_center_be.modules.user.dto.BusinessRoleResponse;
import com.trinh.english_center_be.modules.user.entity.BusinessRole;

import java.util.List;

public interface BRoleService {
    List<BusinessRoleResponse> findAll();
    BusinessRoleResponse findResponseById(String id);
    BusinessRoleResponse create(BusinessRoleRequest businessRoleRequest);
    BusinessRole findById(String id);
    void save(BusinessRole businessRole);
    BusinessRoleResponse updateById(String id, BusinessRoleRequest businessRoleRequest);
    void softDeleteById(String id);
}
