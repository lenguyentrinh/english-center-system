package com.trinh.english_center_be.modules.academic.service;

import com.trinh.english_center_be.modules.academic.dto.CourseRequest;
import com.trinh.english_center_be.modules.academic.dto.CourseResponse;
import com.trinh.english_center_be.modules.academic.entity.Course;
import com.trinh.english_center_be.modules.academic.repository.CourseRepository;
import com.trinh.english_center_be.shared.exception.ResourceNotFoundException;

import java.util.List;

import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;

    @Override
    public List<CourseResponse> findAll() {
        return courseRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public CourseResponse findById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.COURSE, id)));

        return toResponse(course);
    }

    @Override
    @Transactional
    public CourseResponse create(CourseRequest request) {
        Course course = Course.builder()
                .code(request.code())
                .name(request.name())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .maxStudent(request.maxStudent())
                .status(request.status())
                .build();

        return toResponse(courseRepository.save(course));
    }

    @Override
    @Transactional
    public CourseResponse update(Long id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.COURSE, id)));

        course.setCode(request.code());
        course.setName(request.name());
        course.setStartDate(request.startDate());
        course.setEndDate(request.endDate());
        course.setMaxStudent(request.maxStudent());
        course.setStatus(request.status());

        return toResponse(courseRepository.save(course));
    }

    @Override
    @Transactional
    public void softDeleteById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.COURSE, id)));

        course.setActive(false);
        courseRepository.save(course);
    }

    private CourseResponse toResponse(Course course) {
        return new CourseResponse(
                course.getId(),
                course.getCode(),
                course.getName(),
                course.getStartDate(),
                course.getEndDate(),
                course.getMaxStudent(),
                course.getStatus()
        );
    }
}