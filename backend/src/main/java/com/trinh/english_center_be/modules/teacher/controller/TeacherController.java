package com.trinh.english_center_be.modules.teacher.controller;

import com.trinh.english_center_be.modules.teacher.dto.TeacherResponse;
import com.trinh.english_center_be.modules.teacher.dto.TeacherUpsertRequest;
import com.trinh.english_center_be.modules.teacher.service.TeacherService;
import com.trinh.english_center_be.shared.response.ApiResponse;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
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

    @GetMapping
    public ResponseEntity<ApiResponse<List<TeacherResponse>>> getAll(@RequestParam(value = "role", required = false) String role) {
        List<TeacherResponse> list = teacherService.findTeachers(role);
        return ResponseEntity.ok(new ApiResponse<>(200, String.format(MessageConstant.LIST_SUCCESSFULLY, Constant.TEACHER), list));
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

    @PutMapping("/by-user/{userId}")
    public ResponseEntity<ApiResponse<TeacherResponse>> upsertByUserId(@PathVariable Long userId, @RequestBody TeacherUpsertRequest request) {
        TeacherResponse resp = teacherService.upsertByUserId(userId, request);
        return ResponseEntity.ok(new ApiResponse<>(200, String.format(MessageConstant.UPDATED_SUCCESSFULLY, Constant.TEACHER, resp.id()), resp));
    }
    
}
