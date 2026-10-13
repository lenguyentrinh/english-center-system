package com.trinh.english_center_be.modules.user.service;

import com.trinh.english_center_be.modules.user.dto.UserRequest;
import com.trinh.english_center_be.modules.user.dto.UserResponse;
import com.trinh.english_center_be.modules.user.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    // CRUD Operations
    List<UserResponse> findAll();
    UserResponse findByIdResponse(String id);
    UserResponse create(UserRequest request);
    UserResponse update(String id, UserRequest request);
    void softDeleteById(String id);
    
    // Existing methods
    Optional<User> findByUsername(String username);
    boolean existByUserName(String username);
    User findById(String id);
    void save(User user);
    boolean isUserActive(String id);
    boolean existByEmail(String email);
}
