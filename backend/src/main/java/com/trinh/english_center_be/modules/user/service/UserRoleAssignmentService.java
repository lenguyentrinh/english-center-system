package com.trinh.english_center_be.modules.user.service;

import com.trinh.english_center_be.modules.academic.dto.CourseSuggestionResponse;
import com.trinh.english_center_be.modules.user.dto.UserEffectiveRolesResponse;

import java.util.List;

public interface UserRoleAssignmentService {
    void assignRole(Long userId, Long roleId);
    void removeRole(Long userId, Long roleId);
    List<CourseSuggestionResponse> assignBusinessRole(Long userId, Long businessRoleId);
    void removeBusinessRole(Long userId, Long businessRoleId);
    UserEffectiveRolesResponse getEffectiveRoles(Long userId);
}
