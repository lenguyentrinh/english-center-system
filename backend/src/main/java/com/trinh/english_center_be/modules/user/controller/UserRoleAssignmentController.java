package com.trinh.english_center_be.modules.user.controller;

import com.trinh.english_center_be.modules.user.dto.UserEffectiveRolesResponse;
import com.trinh.english_center_be.modules.user.service.UserRoleAssignmentService;
import com.trinh.english_center_be.shared.response.ApiResponse;
import com.trinh.english_center_be.shared.util.StringUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users/{userId}/roles")
@RequiredArgsConstructor
public class UserRoleAssignmentController {

    private final UserRoleAssignmentService userRoleAssignmentService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserEffectiveRolesResponse>> getEffectiveRoles(@PathVariable Long userId) {
        return ResponseEntity.ok(new ApiResponse<>(
                200,
                String.format(StringUtil.RETRIEVED_SUCCESSFULLY, StringUtil.USER, userId),
                userRoleAssignmentService.getEffectiveRoles(userId)
        ));
    }

    @PostMapping("/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> assignRole(
            @PathVariable Long userId,
            @PathVariable Long roleId
    ) {
        userRoleAssignmentService.assignRole(userId, roleId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, String.format(StringUtil.ASSIGN_SUCCESSFULLY, StringUtil.ROLE), null));
    }

    @DeleteMapping("/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> removeRole(
            @PathVariable Long userId,
            @PathVariable Long roleId
    ) {
        userRoleAssignmentService.removeRole(userId, roleId);
        return ResponseEntity.ok(new ApiResponse<>(200, String.format(StringUtil.REMOVE_SUCCESSFULLY, StringUtil.ROLE), null));
    }

    @PostMapping("/business-roles/{businessRoleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> assignBusinessRole(
            @PathVariable Long userId,
            @PathVariable Long businessRoleId
    ) {
        userRoleAssignmentService.assignBusinessRole(userId, businessRoleId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, String.format(StringUtil.ASSIGN_SUCCESSFULLY, StringUtil.BUSINESS_ROLE), null));
    }

    @DeleteMapping("/business-roles/{businessRoleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> removeBusinessRole(
            @PathVariable Long userId,
            @PathVariable Long businessRoleId
    ) {
        userRoleAssignmentService.removeBusinessRole(userId, businessRoleId);
        return ResponseEntity.ok(new ApiResponse<>(200, String.format(StringUtil.REMOVE_SUCCESSFULLY, StringUtil.BUSINESS_ROLE), null));
    }
}
