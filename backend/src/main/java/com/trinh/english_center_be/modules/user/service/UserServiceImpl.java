package com.trinh.english_center_be.modules.user.service;

import com.trinh.english_center_be.modules.user.Repository.UserRepository;
import com.trinh.english_center_be.modules.user.dto.UserRequest;
import com.trinh.english_center_be.modules.user.dto.UserResponse;
import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.shared.enums.UserStatus;
import com.trinh.english_center_be.shared.exception.ExistByFieldException;
import com.trinh.english_center_be.shared.exception.ResourceNotFoundException;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // CRUD Operations
    @Override
    public List<UserResponse> findAll() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public UserResponse findByIdResponse(Long id) {
        User user = findById(id);
        return toResponse(user);
    }

    @Override
    @Transactional
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
                .email(request.email())
                .fullName(request.fullName())
                .phone(request.phone())
                .status(request.status())
                .active(true)
                .build();

        User savedUser = userRepository.save(user);
        return toResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse update(Long id, UserRequest request) {
        User user = findById(id);

        if (!user.getUsername().equals(request.username()) && existByUserName(request.username())) {
            throw new IllegalArgumentException(
                    String.format(MessageConstant.FIELD_ALREADY_VALUE, Constant.USERNAME_FIELD, request.username())
            );
        }

        if (!user.getEmail().equals(request.email()) && existByEmail(request.email())) {
            throw new IllegalArgumentException(
                    String.format(MessageConstant.FIELD_ALREADY_VALUE, Constant.EMAIL_FIELD, request.email())
            );
        }

        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        user.setPhone(request.phone());
        user.setStatus(request.status());

        User updatedUser = userRepository.save(user);
        return toResponse(updatedUser);
    }

    @Override
    @Transactional
    public void softDeleteById(Long id) {
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
    public boolean existByUserName(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public User findById(Long id) {
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
    @Transactional
    public void save(User user) {
        userRepository.save(user);
    }

    @Override
    public boolean isUserActive(Long id) {
        return userRepository.findById(id)
                .map(user -> user.getStatus() == UserStatus.ACTIVE)
                .orElse(false);
    }

    @Override
    public boolean existByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    // Mapping helper method
    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getStatus(),
                user.getCreatedAt(),
                user.getUpdateAt()
        );
    }
}
