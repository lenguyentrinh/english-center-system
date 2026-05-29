package com.trinh.english_center_be.modules.teacher.controller;

import com.trinh.english_center_be.modules.teacher.dto.TeacherResponse;
import com.trinh.english_center_be.modules.teacher.dto.TeacherUpsertRequest;
import com.trinh.english_center_be.modules.teacher.service.TeacherService;
import com.trinh.english_center_be.modules.academic.dto.CourseResponse;
import com.trinh.english_center_be.modules.academic.service.CourseService;
import com.trinh.english_center_be.shared.enums.Roles;
import com.trinh.english_center_be.shared.response.ApiResponse;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/teachers"})
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;
    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TeacherResponse>>> getAll(@RequestParam(value = "role", required = false) String role) {
        List<TeacherResponse> teachers = teacherService.findTeachers(role);
        return ResponseEntity.ok(new ApiResponse<>(200, String.format(MessageConstant.LIST_SUCCESSFULLY, Constant.TEACHER), teachers));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TeacherResponse>> getById(@PathVariable Long id) {
        return teacherService.findById(id)
                .map(t -> ResponseEntity.ok(new ApiResponse<>(200, String.format(MessageConstant.RETRIEVED_SUCCESSFULLY, Constant.TEACHER, id), t)))
                .orElseGet(() -> ResponseEntity.ok(new ApiResponse<>(404, String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.TEACHER, id), null)));
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<ApiResponse<TeacherResponse>> getByUserId(@PathVariable Long userId) {
        return teacherService.findByUserId(userId)
                .map(t -> ResponseEntity.ok(new ApiResponse<>(200, String.format(MessageConstant.RETRIEVED_SUCCESSFULLY, Constant.TEACHER, t.id()), t)))
                .orElseGet(() -> ResponseEntity.ok(new ApiResponse<>(404, String.format(MessageConstant.NOT_FOUND_BY_ID, "Teacher for user", userId), null)));
    }

    @GetMapping("/by-user/{userId}/courses")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getCoursesByUserId(@PathVariable Long userId,
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
    public ResponseEntity<ApiResponse<TeacherResponse>> upsertByUserId(@PathVariable Long userId, @RequestBody TeacherUpsertRequest request) {
        TeacherResponse resp = teacherService.upsertByUserId(userId, request);
        return ResponseEntity.ok(new ApiResponse<>(200, String.format(MessageConstant.UPDATED_SUCCESSFULLY, Constant.TEACHER, resp.id()), resp));
    }
    
}
