package com.trinh.english_center_be.modules.user.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.trinh.english_center_be.modules.user.Repository.UserRepository;
import com.trinh.english_center_be.modules.user.dto.UserUpdateRequest;
import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.shared.enums.UserStatus;
import com.trinh.english_center_be.shared.exception.ExistByFieldException;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UserServiceImplUpdateTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;

    UserServiceImpl service;
    User user;

    @BeforeEach
    void setUp() {
        service = new UserServiceImpl(userRepository, passwordEncoder);
        user = User.builder().id("u1").username("alice").email("a@b.com").password("existing-hash")
                .fullName("Alice Old").phone("0123456789").status(UserStatus.ACTIVE).emailVerified(true).build();
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        org.mockito.Mockito.lenient().when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private UserUpdateRequest request(String email, UserStatus status) {
        return new UserUpdateRequest("alice", email, "Alice New", "0987654321", status);
    }

    @Test
    void updateNeverTouchesThePassword() {
        service.update("u1", request("a@b.com", UserStatus.ACTIVE), true);

        assertThat(user.getPassword()).isEqualTo("existing-hash");
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    void profileFieldsAreUpdated() {
        service.update("u1", request("a@b.com", UserStatus.ACTIVE), false);

        assertThat(user.getFullName()).isEqualTo("Alice New");
        assertThat(user.getPhone()).isEqualTo("0987654321");
    }

    @Test
    void nonAdminCannotChangeStatusOrEmail() {
        service.update("u1", request("other@b.com", UserStatus.LOCKED), false);

        assertThat(user.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(user.getEmail()).isEqualTo("a@b.com");
    }

    @Test
    void adminCanChangeStatusAndEmail() {
        when(userRepository.findByEmailIgnoreCase("New@B.com")).thenReturn(Optional.empty());

        service.update("u1", request("New@B.com", UserStatus.LOCKED), true);

        assertThat(user.getStatus()).isEqualTo(UserStatus.LOCKED);
        assertThat(user.getEmail()).isEqualTo("new@b.com");
    }

    @Test
    void duplicateEmailIsAConflictNotA500() {
        when(userRepository.findByEmailIgnoreCase("taken@b.com")).thenReturn(Optional.of(new User()));

        assertThatThrownBy(() -> service.update("u1", request("taken@b.com", UserStatus.ACTIVE), true))
                .isInstanceOf(ExistByFieldException.class);
    }

    @Test
    void userWithoutAnEmailDoesNotCauseANullPointer() {
        user.setEmail(null);
        when(userRepository.findByEmailIgnoreCase("a@b.com")).thenReturn(Optional.empty());

        service.update("u1", request("a@b.com", UserStatus.ACTIVE), true);

        assertThat(user.getEmail()).isEqualTo("a@b.com");
    }
}
