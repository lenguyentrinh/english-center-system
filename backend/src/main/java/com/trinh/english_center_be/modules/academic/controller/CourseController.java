package com.trinh.english_center_be.modules.academic.controller;

import com.trinh.english_center_be.modules.academic.dto.CourseRequest;
import com.trinh.english_center_be.modules.academic.dto.CourseResponse;
import com.trinh.english_center_be.modules.academic.service.CourseService;
import com.trinh.english_center_be.shared.response.ApiResponse;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/courses"})
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(200, MessageConstant.LIST_SUCCESSFULLY, courseService.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(
                200,
                String.format(MessageConstant.RETRIEVED_SUCCESSFULLY, Constant.COURSE, id),
                courseService.findById(id)
        ));
    }

    @PostMapping
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CourseResponse>> create(@Valid @RequestBody CourseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, String.format(MessageConstant.CREATED_SUCCESSFULLY, Constant.COURSE), courseService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CourseResponse>> update(@PathVariable Long id, @Valid @RequestBody CourseRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(
                200,
                String.format(MessageConstant.UPDATED_SUCCESSFULLY, Constant.COURSE, id),
                courseService.update(id, request)
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        courseService.softDeleteById(id);
        return ResponseEntity.ok(new ApiResponse<>(200, String.format(MessageConstant.DELETED_SUCCESSFULLY, Constant.COURSE), null));
    }
}