package com.trinh.english_center_be.modules.user.controller;

import com.trinh.english_center_be.modules.auth.security.AuthUserDetails;
import com.trinh.english_center_be.modules.user.dto.UserRequest;
import com.trinh.english_center_be.modules.user.dto.UserResponse;
import com.trinh.english_center_be.modules.user.dto.UserUpdateRequest;
import com.trinh.english_center_be.modules.user.service.UserService;
import com.trinh.english_center_be.shared.enums.UserStatus;
import com.trinh.english_center_be.shared.response.ApiResponse;
import com.trinh.english_center_be.shared.response.PageResponse;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private static String actingId(Authentication authentication) {
        return authentication.getPrincipal() instanceof AuthUserDetails u ? u.getId() : null;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAll() {
        return ResponseEntity.ok(
                new ApiResponse<>(200, MessageConstant.LIST_SUCCESSFULLY, userService.findAll())
        );
    }

    /** Paged/filtered list: q (name/username/email), role (ADMIN|TEACHER|STUDENT|exact code), status, page (1-based), size. */
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                new ApiResponse<>(200, MessageConstant.LIST_SUCCESSFULLY, userService.search(q, role, status, page, size))
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<ApiResponse<UserResponse>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                new ApiResponse<>(200, String.format(MessageConstant.RETRIEVED_SUCCESSFULLY, Constant.USER, id),
                        userService.findByIdResponse(id))
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> create(@Valid @RequestBody UserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, String.format(MessageConstant.CREATED_SUCCESSFULLY, Constant.USER),
                        userService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<ApiResponse<UserResponse>> update(@PathVariable String id,
                                                            @Valid @RequestBody UserUpdateRequest request,
                                                            Authentication authentication
    ) {
        boolean admin = authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        return ResponseEntity.ok(
                new ApiResponse<>(200, String.format(MessageConstant.UPDATED_SUCCESSFULLY, Constant.USER, id),
                        userService.update(id, request, admin, actingId(authentication)))
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id, Authentication authentication) {
        userService.softDeleteById(id, actingId(authentication));
        return ResponseEntity.ok(
                new ApiResponse<>(200, String.format(MessageConstant.DELETED_SUCCESSFULLY, Constant.USER), null)
        );
    }
}
