package com.trinh.english_center_be.modules.academic.service;

import com.trinh.english_center_be.modules.academic.dto.TeachingClassRequest;
import com.trinh.english_center_be.modules.academic.dto.TeachingClassResponse;

import java.util.List;

public interface TeachingClassService {
    public List<TeachingClassResponse> findAll();
    public TeachingClassResponse findById(Long id);
    public TeachingClassResponse create(TeachingClassRequest request);
    public TeachingClassResponse update(Long id, TeachingClassRequest request);
    public void softDeleteById(Long id);
}
