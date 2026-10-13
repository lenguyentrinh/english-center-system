package com.trinh.english_center_be.modules.user.service;

import com.trinh.english_center_be.modules.academic.dto.CourseSuggestionResponse;
import com.trinh.english_center_be.modules.user.dto.UserEffectiveRolesResponse;

import java.util.List;

public interface UserRoleAssignmentService {
    void assignRole(String userId, String roleId);
    void removeRole(String userId, String roleId);
    List<CourseSuggestionResponse> assignBusinessRole(String userId, String businessRoleId);
    void removeBusinessRole(String userId, String businessRoleId);
    UserEffectiveRolesResponse getEffectiveRoles(String userId);
}
