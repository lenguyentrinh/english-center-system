package com.trinh.english_center_be.modules.user.controller;

import com.trinh.english_center_be.modules.user.dto.BusinessRoleRequest;
import com.trinh.english_center_be.modules.user.dto.BusinessRoleResponse;
import com.trinh.english_center_be.modules.user.service.BRoleService;
import com.trinh.english_center_be.modules.academic.service.CourseService;
import com.trinh.english_center_be.shared.enums.Roles;
import com.trinh.english_center_be.shared.response.ApiResponse;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/business-roles")
@RequiredArgsConstructor
public class BusinessRoleController {

        private final BRoleService bRoleService;
        private final CourseService courseService;

        @GetMapping("/{id}/roles")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<List<Roles>>> getRolesForBusinessRole(@PathVariable Long id) {
                var br = bRoleService.findByIdWithRoles(id);
                List<Roles> roles = br.getRoles() == null ? List.of() : br.getRoles().stream()
                                .filter(r -> Boolean.TRUE.equals(r.getActive()))
                                .map(r -> r.getCode())
                                .toList();
                return ResponseEntity.ok(new ApiResponse<>(200, String.format(MessageConstant.LIST_SUCCESSFULLY, "Roles"), roles));
        }

        @GetMapping("/{id}/suggested-courses")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<List<com.trinh.english_center_be.modules.academic.dto.CourseResponse>>> getSuggestedCourses(@PathVariable Long id) {
                var br = bRoleService.findByIdWithRoles(id);
                List<Roles> roles = br.getRoles() == null ? List.of() : br.getRoles().stream()
                                .filter(r -> Boolean.TRUE.equals(r.getActive()))
                                .map(r -> r.getCode())
                                .toList();
                var courses = courseService.findAvailableByRoles(roles);
                return ResponseEntity.ok(new ApiResponse<>(200, String.format(MessageConstant.LIST_SUCCESSFULLY, Constant.COURSE), courses));
        }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BusinessRoleResponse>>> getAll() {
        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        String.format(MessageConstant.LIST_SUCCESSFULLY, Constant.BUSINESS_ROLE),
                        bRoleService.findAll()
                )
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BusinessRoleResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        String.format(MessageConstant.RETRIEVED_SUCCESSFULLY, Constant.BUSINESS_ROLE, id),
                        bRoleService.findResponseById(id)
                )
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BusinessRoleResponse>> create(@Valid @RequestBody BusinessRoleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        201,
                        String.format(MessageConstant.CREATED_SUCCESSFULLY, Constant.BUSINESS_ROLE),
                        bRoleService.create(request)
                ));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BusinessRoleResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody BusinessRoleRequest request
    ) {
        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        String.format(MessageConstant.UPDATED_SUCCESSFULLY, Constant.BUSINESS_ROLE, id),
                        bRoleService.updateById(id, request)
                )
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        bRoleService.softDeleteById(id);
        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        String.format(MessageConstant.DELETED_SUCCESSFULLY, Constant.BUSINESS_ROLE),
                        null
                )
        );
    }
}
