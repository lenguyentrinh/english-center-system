package com.trinh.english_center_be.modules.user.service;

import com.trinh.english_center_be.modules.user.entity.User;

import java.util.Optional;

public interface UserService {
    Optional<User> findByUsername(String username);
    boolean existByUserName(String username);
    User findById(Long id);
    void save(User user);
    boolean isUserActive(Long id);
    boolean existByEmail(String email);
}
