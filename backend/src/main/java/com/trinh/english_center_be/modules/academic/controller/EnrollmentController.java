package com.trinh.english_center_be.modules.academic.controller;

import com.trinh.english_center_be.modules.academic.dto.CourseStudentResponse;
import com.trinh.english_center_be.modules.academic.dto.EnrollRequest;
import com.trinh.english_center_be.modules.academic.dto.StudentEnrollmentResponse;
import com.trinh.english_center_be.modules.academic.service.EnrollmentService;
import com.trinh.english_center_be.modules.auth.security.AuthUserDetails;
import com.trinh.english_center_be.shared.response.ApiResponse;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    private static boolean isAdmin(Authentication auth) {
        return auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    /** Admin, or the teacher who owns the course (checked in the service). */
    @GetMapping("/courses/{id}/students")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<CourseStudentResponse>>> students(@PathVariable String id,
                                                                              @RequestParam(required = false) String status,
                                                                              Authentication auth) {
        String acting = auth.getPrincipal() instanceof AuthUserDetails u ? u.getId() : null;
        return ResponseEntity.ok(new ApiResponse<>(200, "Students listed successfully",
                enrollmentService.listStudents(id, status, acting, isAdmin(auth))));
    }

    @PostMapping("/courses/{id}/students")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CourseStudentResponse>> enroll(@PathVariable String id, @Valid @RequestBody EnrollRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, "Student enrolled successfully", enrollmentService.enroll(id, request.userId(), request.forced())));
    }

    @DeleteMapping("/courses/{id}/students/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> cancel(@PathVariable String id, @PathVariable String userId) {
        enrollmentService.cancel(id, userId);
        return ResponseEntity.ok(new ApiResponse<>(200, "Enrollment cancelled successfully", null));
    }

    @GetMapping("/users/{id}/enrollments")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<ApiResponse<List<StudentEnrollmentResponse>>> enrollments(@PathVariable String id) {
        return ResponseEntity.ok(new ApiResponse<>(200, "Enrollments listed successfully", enrollmentService.listForUser(id)));
    }
}
