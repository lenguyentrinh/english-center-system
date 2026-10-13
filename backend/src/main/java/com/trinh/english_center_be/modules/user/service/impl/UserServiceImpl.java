package com.trinh.english_center_be.modules.user.service.impl;

import com.trinh.english_center_be.modules.user.Repository.UserRepository;
import com.trinh.english_center_be.modules.user.dto.UserRequest;
import com.trinh.english_center_be.modules.user.dto.UserResponse;
import com.trinh.english_center_be.modules.user.dto.UserUpdateRequest;
import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.modules.user.service.UserService;
import com.trinh.english_center_be.shared.enums.UserStatus;
import com.trinh.english_center_be.shared.exception.ExistByFieldException;
import com.trinh.english_center_be.shared.exception.ResourceNotFoundException;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import com.trinh.english_center_be.modules.user.mapper.UserMapper;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // CRUD Operations
    @Override
    public List<UserResponse> findAll() {
        return userRepository.findAll()
            .stream()
            .map(UserMapper::toResponse)
            .toList();
    }

    @Override
    public UserResponse findByIdResponse(String id) {
        User user = findById(id);
        return UserMapper.toResponse(user);
    }

    @Override
    public UserResponse create(UserRequest request) {
        if (existByUserName(request.username())) {
            throw new ExistByFieldException(
                    String.format(MessageConstant.FIELD_ALREADY_VALUE, Constant.USERNAME_FIELD, request.username())
            );
        }

        if (existByEmail(request.email())) {
            throw new ExistByFieldException(
                    String.format(MessageConstant.FIELD_ALREADY_VALUE, Constant.EMAIL_FIELD, request.email())
            );
        }

        User user = User.builder()
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .email(request.email().trim().toLowerCase())
                .fullName(request.fullName())
                .phone(request.phone())
                .status(request.status())
                .emailVerified(true)
                .active(true)
                .build();

        User savedUser = userRepository.save(user);
        return UserMapper.toResponse(savedUser);
    }

    @Override
    public UserResponse update(String id, UserUpdateRequest request, boolean admin) {
        User user = findById(id);

        if (!request.username().equals(user.getUsername()) && existByUserName(request.username())) {
            throw new ExistByFieldException(
                    String.format(MessageConstant.FIELD_ALREADY_VALUE, Constant.USERNAME_FIELD, request.username())
            );
        }
        user.setUsername(request.username());

        // Changing the email would need re-verification, so it is an admin-only operation.
        if (admin && !request.email().equalsIgnoreCase(user.getEmail())) {
            if (existByEmail(request.email())) {
                throw new ExistByFieldException(
                        String.format(MessageConstant.FIELD_ALREADY_VALUE, Constant.EMAIL_FIELD, request.email())
                );
            }
            user.setEmail(request.email().trim().toLowerCase());
        }

        user.setFullName(request.fullName());
        user.setPhone(request.phone());

        // A user must not be able to reactivate or otherwise change their own account state.
        if (admin && request.status() != null) {
            user.setStatus(request.status());
        }

        return UserMapper.toResponse(userRepository.save(user));
    }

    @Override
    public void softDeleteById(String id) {
        User user = findById(id);
        user.setActive(false);
        userRepository.save(user);
    }

    // Existing methods
    @Override
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email);
    }

    @Override
    public boolean existByUserName(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public User findById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(
                                MessageConstant.NOT_FOUND_BY_ID,
                                Constant.USER,
                                id
                        )
                ));
    }

    @Override
    public void save(User user) {
        userRepository.save(user);
    }

    @Override
    public boolean isUserActive(String id) {
        return userRepository.findById(id)
                .map(user -> user.getStatus() == UserStatus.ACTIVE)
                .orElse(false);
    }

    @Override
    public boolean existByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email.trim()).isPresent();
    }
}
