package com.trinh.english_center_be.modules.user.service;

import com.trinh.english_center_be.modules.user.dto.UserEffectiveRolesResponse;

public interface UserRoleAssignmentService {
    void assignRole(Long userId, Long roleId);
    void removeRole(Long userId, Long roleId);
    void assignBusinessRole(Long userId, Long businessRoleId);
    void removeBusinessRole(Long userId, Long businessRoleId);
    UserEffectiveRolesResponse getEffectiveRoles(Long userId);
}
