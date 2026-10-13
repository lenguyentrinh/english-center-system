package com.trinh.english_center_be.modules.auth.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.trinh.english_center_be.modules.auth.dto.LoginRequest;
import com.trinh.english_center_be.modules.auth.dto.SignupRequest;
import com.trinh.english_center_be.modules.auth.service.EmailVerificationService;
import com.trinh.english_center_be.modules.auth.service.RefreshTokenService;
import com.trinh.english_center_be.modules.user.entity.Role;
import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.modules.user.service.RoleService;
import com.trinh.english_center_be.modules.user.service.UserRoleAssignmentService;
import com.trinh.english_center_be.modules.user.service.UserService;
import com.trinh.english_center_be.shared.config.JwtTokenProvider;
import com.trinh.english_center_be.shared.enums.Roles;
import com.trinh.english_center_be.shared.enums.UserStatus;
import com.trinh.english_center_be.shared.exception.InvalidCredentialException;
import com.trinh.english_center_be.shared.exception.UnauthorizedException;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplLoginTest {

    @Mock UserService userService;
    @Mock UserDetailsService userDetailsService;
    @Mock JwtTokenProvider jwtTokenProvider;
    @Mock RefreshTokenService refreshTokenService;
    @Mock RoleService roleService;
    @Mock UserRoleAssignmentService userRoleAssignmentService;
    @Mock PasswordEncoder passwordEncoder;
    @Mock EmailVerificationService emailVerificationService;

    AuthServiceImpl service;
    User user;

    @BeforeEach
    void setUp() {
        service = new AuthServiceImpl(userService, userDetailsService, jwtTokenProvider, refreshTokenService,
                roleService, userRoleAssignmentService, passwordEncoder, emailVerificationService);
        user = User.builder().id("u1").username("alice").email("a@b.com").password("hash")
                .status(UserStatus.ACTIVE).emailVerified(false).build();
    }

    @Test
    void unverifiedEmailCannotLogInAfterTheCorrectPassword() {
        when(userService.findByUsername("alice")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass1234", "hash")).thenReturn(true);

        assertThatThrownBy(() -> service.login(new LoginRequest("alice", "pass1234")))
                .isInstanceOfSatisfying(UnauthorizedException.class, ex -> {
                    assertThat(ex.getOrigin()).isEqualTo("email-not-verified");
                });

        verify(refreshTokenService, never()).issue(any());
    }

    @Test
    void wrongPasswordNeverRevealsTheVerificationState() {
        when(userService.findByUsername("alice")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("bad-pass1", "hash")).thenReturn(false);

        assertThatThrownBy(() -> service.login(new LoginRequest("alice", "bad-pass1")))
                .isInstanceOf(InvalidCredentialException.class)
                .hasMessage("Invalid username or password");
    }

    @Test
    void signupCreatesAnUnverifiedAccountAndSendsACode() {
        when(userService.existByUserName("newuser")).thenReturn(false);
        when(userService.findByEmail("N@X.com")).thenReturn(Optional.empty());
        when(roleService.findRoleByRoleName(Roles.STUDENT)).thenReturn(Optional.of(Role.builder().id("r1").build()));
        when(passwordEncoder.encode("pass1234")).thenReturn("hash");

        service.signup(new SignupRequest("newuser", "pass1234", "N@X.com", "New User", null));

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(userService).save(saved.capture());
        assertThat(saved.getValue().isEmailVerified()).isFalse();
        assertThat(saved.getValue().getEmail()).isEqualTo("n@x.com");
        verify(emailVerificationService).sendCode("n@x.com");
    }
}
