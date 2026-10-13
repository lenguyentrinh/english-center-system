package com.trinh.english_center_be.modules.academic.controller;

import com.trinh.english_center_be.modules.academic.dto.SessionRequest;
import com.trinh.english_center_be.modules.academic.dto.SessionResponse;
import com.trinh.english_center_be.modules.academic.service.SessionService;
import com.trinh.english_center_be.shared.response.ApiResponse;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import jakarta.validation.Valid;
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

import java.util.List;

@RestController
@RequestMapping("/courses/{courseId}/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getByCourseId(@PathVariable String courseId) {
        return ResponseEntity.ok(new ApiResponse<>(
                200,
                String.format(MessageConstant.LIST_SUCCESSFULLY, Constant.SESSION),
                sessionService.findByCourseId(courseId)
        ));
    }

    @PostMapping
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SessionResponse>> create(
            @PathVariable String courseId,
            @Valid @RequestBody SessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        201,
                        String.format(MessageConstant.CREATED_SUCCESSFULLY, Constant.SESSION),
                        sessionService.create(courseId, request)
                ));
    }

    @PutMapping("/{sessionId}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SessionResponse>> update(
            @PathVariable String courseId,
            @PathVariable String sessionId,
            @Valid @RequestBody SessionRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(
                200,
                String.format(MessageConstant.UPDATED_SUCCESSFULLY, Constant.SESSION, sessionId),
                sessionService.update(courseId, sessionId, request)
        ));
    }

    @DeleteMapping("/{sessionId}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable String courseId,
            @PathVariable String sessionId) {
        sessionService.delete(courseId, sessionId);
        return ResponseEntity.ok(new ApiResponse<>(
                200,
                String.format(MessageConstant.DELETED_SUCCESSFULLY, Constant.SESSION),
                null
        ));
    }
}
