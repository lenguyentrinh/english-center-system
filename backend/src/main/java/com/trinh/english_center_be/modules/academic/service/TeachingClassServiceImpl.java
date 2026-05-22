package com.trinh.english_center_be.modules.academic.service;

import com.trinh.english_center_be.modules.academic.dto.TeachingClassRequest;
import com.trinh.english_center_be.modules.academic.dto.TeachingClassResponse;
import com.trinh.english_center_be.modules.academic.entity.TeachingClass;
import com.trinh.english_center_be.modules.academic.repository.TeachingClassRepository;
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
public class TeachingClassServiceImpl implements TeachingClassService {

    private final TeachingClassRepository teachingClassRepository;

    @Override
    public List<TeachingClassResponse> findAll() {
        return teachingClassRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public TeachingClassResponse findById(Long id) {
        TeachingClass teachingClass = teachingClassRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.CLASS, id))
                );

        return toResponse(teachingClass);
    }

    @Override
    @Transactional
    public TeachingClassResponse create(TeachingClassRequest request) {

        TeachingClass teachingClass = TeachingClass.builder()
                .code(request.code())
                .name(request.name())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .maxStudent(request.maxStudent())
                .status(request.status())
                .build();

        return toResponse(teachingClassRepository.save(teachingClass));
    }

    @Override
    @Transactional
    public TeachingClassResponse update(Long id, TeachingClassRequest request) {

        TeachingClass teachingClass = teachingClassRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.CLASS, id))
                );

        teachingClass.setCode(request.code());
        teachingClass.setName(request.name());
        teachingClass.setStartDate(request.startDate());
        teachingClass.setEndDate(request.endDate());
        teachingClass.setMaxStudent(request.maxStudent());
        teachingClass.setStatus(request.status());

        return toResponse(teachingClassRepository.save(teachingClass));
    }

    @Override
    @Transactional
    public void softDeleteById(Long id) {

        TeachingClass teachingClass = teachingClassRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.BUSINESS_ROLE, id))
                );

        teachingClass.setActive(false);

        teachingClassRepository.save(teachingClass);
    }

    private TeachingClassResponse toResponse(TeachingClass teachingClass) {
        return new TeachingClassResponse(
                teachingClass.getId(),
                teachingClass.getCode(),
                teachingClass.getName(),
                teachingClass.getStartDate(),
                teachingClass.getEndDate(),
                teachingClass.getMaxStudent(),
                teachingClass.getStatus()
        );
    }
}