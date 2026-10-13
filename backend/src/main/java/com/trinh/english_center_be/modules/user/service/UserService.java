package com.trinh.english_center_be.modules.user.service;

import com.trinh.english_center_be.modules.user.dto.UserRequest;
import com.trinh.english_center_be.modules.user.dto.UserResponse;
import com.trinh.english_center_be.modules.user.dto.UserUpdateRequest;
import com.trinh.english_center_be.modules.user.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    // CRUD Operations
    List<UserResponse> findAll();
    UserResponse findByIdResponse(String id);
    UserResponse create(UserRequest request);
    /** @param admin only admins may change {@code status} and {@code email}; for others those fields are ignored. */
    UserResponse update(String id, UserUpdateRequest request, boolean admin);
    void softDeleteById(String id);
    
    // Existing methods
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existByUserName(String username);
    User findById(String id);
    void save(User user);
    boolean isUserActive(String id);
    boolean existByEmail(String email);
}
