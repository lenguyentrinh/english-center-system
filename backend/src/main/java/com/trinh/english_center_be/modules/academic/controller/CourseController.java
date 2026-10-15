package com.trinh.english_center_be.modules.academic.controller;

import com.trinh.english_center_be.modules.academic.dto.CourseRequest;
import com.trinh.english_center_be.modules.academic.dto.CourseResponse;
import com.trinh.english_center_be.modules.academic.dto.TeacherScheduleResponse;
import com.trinh.english_center_be.modules.academic.service.CourseScheduleService;
import com.trinh.english_center_be.modules.academic.service.CourseService;
import com.trinh.english_center_be.modules.auth.security.AuthUserDetails;
import com.trinh.english_center_be.shared.response.ApiResponse;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
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
@RequestMapping({"/courses"})
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final CourseScheduleService courseScheduleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(200, MessageConstant.LIST_SUCCESSFULLY, courseService.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> getById(@PathVariable String id) {
        return ResponseEntity.ok(new ApiResponse<>(
                200,
                String.format(MessageConstant.RETRIEVED_SUCCESSFULLY, Constant.COURSE, id),
                courseService.findById(id)
        ));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CourseResponse>> create(@Valid @RequestBody CourseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, String.format(MessageConstant.CREATED_SUCCESSFULLY, Constant.COURSE), courseService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CourseResponse>> update(@PathVariable String id, @Valid @RequestBody CourseRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(
                200,
                String.format(MessageConstant.UPDATED_SUCCESSFULLY, Constant.COURSE, id),
                courseService.update(id, request)
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        courseService.softDeleteById(id);
        return ResponseEntity.ok(new ApiResponse<>(200, String.format(MessageConstant.DELETED_SUCCESSFULLY, Constant.COURSE), null));
    }

    @PostMapping("/{id}/assign-teacher/{teacherId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CourseResponse>> assignTeacher(@PathVariable String id, @PathVariable String teacherId,
                                                                      @RequestParam(defaultValue = "false") boolean force) {
        CourseResponse res = courseService.assignTeacher(id, teacherId, force);
        return ResponseEntity.ok(new ApiResponse<>(200, String.format(MessageConstant.ASSIGN_SUCCESSFULLY, "Teacher"), res));
    }

    /**
     * Dated sessions per teacher in [from, to] (defaults to this week). Admin: any/all teachers. Others: own row only.
     * Declared before /{id} patterns by being a literal path, so it never collides with a course id.
     */
    @GetMapping("/schedule")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<TeacherScheduleResponse>>> schedule(
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Authentication authentication) {
        boolean admin = authentication.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        String actingUserId = authentication.getPrincipal() instanceof AuthUserDetails u ? u.getId() : null;
        return ResponseEntity.ok(new ApiResponse<>(200, "Schedule retrieved successfully",
                courseScheduleService.schedule(teacherId, from, to, actingUserId, admin)));
    }
}