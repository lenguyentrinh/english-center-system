package com.trinh.english_center_be.modules.teacher.controller;

import com.trinh.english_center_be.modules.academic.dto.CourseResponse;
import com.trinh.english_center_be.modules.academic.service.CourseService;
import com.trinh.english_center_be.modules.teacher.dto.TeacherCategoriesRequest;
import com.trinh.english_center_be.modules.teacher.dto.TeacherResponse;
import com.trinh.english_center_be.modules.teacher.dto.TeacherUpsertRequest;
import com.trinh.english_center_be.modules.teacher.service.TeacherService;
import com.trinh.english_center_be.shared.enums.Roles;
import com.trinh.english_center_be.shared.response.ApiResponse;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/teachers"})
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;
    private final CourseService courseService;

    private static boolean isAdmin(Authentication auth) {
        return auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    /** Salary is admin-only data. */
    private static TeacherResponse view(TeacherResponse t, Authentication auth) {
        return isAdmin(auth) ? t : t.withoutSalary();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TeacherResponse>>> getAll(@RequestParam(value = "role", required = false) String role,
                                                                      Authentication auth) {
        List<TeacherResponse> teachers = teacherService.findTeachers(role).stream().map(t -> view(t, auth)).toList();
        return ResponseEntity.ok(new ApiResponse<>(200, String.format(MessageConstant.LIST_SUCCESSFULLY, Constant.TEACHER), teachers));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TeacherResponse>> getById(@PathVariable String id, Authentication auth) {
        return teacherService.findById(id)
                .map(t -> ResponseEntity.ok(new ApiResponse<>(200, String.format(MessageConstant.RETRIEVED_SUCCESSFULLY, Constant.TEACHER, id), view(t, auth))))
                .orElseGet(() -> ResponseEntity.ok(new ApiResponse<>(404, String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.TEACHER, id), null)));
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<ApiResponse<TeacherResponse>> getByUserId(@PathVariable String userId, Authentication auth) {
        return teacherService.findByUserId(userId)
                .map(t -> ResponseEntity.ok(new ApiResponse<>(200, String.format(MessageConstant.RETRIEVED_SUCCESSFULLY, Constant.TEACHER, t.id()), view(t, auth))))
                .orElseGet(() -> ResponseEntity.ok(new ApiResponse<>(404, String.format(MessageConstant.NOT_FOUND_BY_ID, "Teacher for user", userId), null)));
    }

    @GetMapping("/by-user/{userId}/courses")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getCoursesByUserId(@PathVariable String userId,
                                                                                @RequestParam(value = "availableRoles", required = false) String availableRolesCsv) {
        List<CourseResponse> courses;
        if (availableRolesCsv == null || availableRolesCsv.isBlank()) {
            courses = courseService.findByTeacherUserId(userId);
        } else {
            String[] tokens = availableRolesCsv.split(",");
            List<Roles> roles = new ArrayList<>();
            for (String t : tokens) {
                try {
                    roles.add(Roles.valueOf(t.trim()));
                } catch (IllegalArgumentException ex) {
                    // ignore unknown role code
                }
            }
            courses = courseService.findByTeacherUserIdAndAvailableRoles(userId, roles);
        }
        return ResponseEntity.ok(new ApiResponse<>(200, String.format(MessageConstant.LIST_SUCCESSFULLY, Constant.COURSE), courses));
    }

    @PutMapping("/by-user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TeacherResponse>> upsertByUserId(@PathVariable String userId, @RequestBody TeacherUpsertRequest request) {
        TeacherResponse resp = teacherService.upsertByUserId(userId, request);
        return ResponseEntity.ok(new ApiResponse<>(200, String.format(MessageConstant.UPDATED_SUCCESSFULLY, Constant.TEACHER, resp.id()), resp));
    }

    /** Replaces the teacher's category specialties. */
    @PutMapping("/{id}/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TeacherResponse>> updateCategories(@PathVariable String id,
                                                                         @Valid @RequestBody TeacherCategoriesRequest request) {
        TeacherResponse resp = teacherService.updateCategories(id, request.categoryIds());
        return ResponseEntity.ok(new ApiResponse<>(200, String.format(MessageConstant.UPDATED_SUCCESSFULLY, Constant.TEACHER, id), resp));
    }
}
