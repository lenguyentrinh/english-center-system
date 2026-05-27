package com.trinh.english_center_be.modules.teacher.controller;

import com.trinh.english_center_be.modules.teacher.dto.TeacherResponse;
import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import com.trinh.english_center_be.modules.teacher.repository.TeacherRepository;
import com.trinh.english_center_be.shared.response.ApiResponse;
import com.trinh.english_center_be.shared.util.MessageConstant;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/teachers"})
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherRepository teacherRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TeacherResponse>>> getAll() {
        List<TeacherResponse> list = teacherRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(200, String.format(MessageConstant.LIST_SUCCESSFULLY, "Teacher"), list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TeacherResponse>> getById(@PathVariable Long id) {
        return teacherRepository.findById(id)
                .map(t -> ResponseEntity.ok(new ApiResponse<>(200, String.format(MessageConstant.RETRIEVED_SUCCESSFULLY, "Teacher", id), toResponse(t))))
                .orElseGet(() -> ResponseEntity.ok(new ApiResponse<>(404, String.format(MessageConstant.NOT_FOUND_BY_ID, "Teacher", id), null)));
    }

    private TeacherResponse toResponse(Teacher t) {
        String fullName = t.getUser() != null ? t.getUser().getFullName() : null;
        return new TeacherResponse(t.getId(), fullName);
    }
}
