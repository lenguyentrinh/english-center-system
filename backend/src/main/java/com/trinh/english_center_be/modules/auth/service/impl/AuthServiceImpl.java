package com.trinh.english_center_be.modules.auth.service.impl;

import com.trinh.english_center_be.modules.auth.dto.AuthTokens;
import com.trinh.english_center_be.modules.auth.dto.ChangePasswordRequest;
import com.trinh.english_center_be.modules.auth.dto.LoginRequest;
import com.trinh.english_center_be.modules.auth.dto.MeResponse;
import com.trinh.english_center_be.modules.auth.dto.SignupRequest;
import com.trinh.english_center_be.modules.auth.security.AuthUserDetails;
import com.trinh.english_center_be.modules.auth.service.AuthService;
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
import com.trinh.english_center_be.shared.exception.*;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    /** One message for every wrong-credential case so the endpoint cannot be used to probe accounts. */
    private static final String INVALID_CREDENTIALS = "Invalid username or password";

    private final UserService userService;
    private final UserDetailsService userDetailsService;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final RoleService roleService;
    private final UserRoleAssignmentService userRoleAssignmentService;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;

    /** A real bcrypt hash compared when the user does not exist, so timing does not reveal existence. */
    private String dummyHash;

    @Override
    public AuthTokens login(LoginRequest request) {
        String identifier = request.username().trim();
        User user = (identifier.contains("@")
                ? userService.findByEmail(identifier)
                : userService.findByUsername(identifier)).orElse(null);

        if (user == null) {
            passwordEncoder.matches(request.password(), dummyHash());
            throw new InvalidCredentialException(INVALID_CREDENTIALS);
        }
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialException(INVALID_CREDENTIALS);
        }
        // Only someone who knows the password learns the account state.
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UnauthorizedException(MessageConstant.USER_ACCOUNT_NOT_ACTIVE);
        }

        if (!user.isEmailVerified()) {
            // The frontend keys on this origin to send the user to the verification page.
            throw new UnauthorizedException("Email not verified", "email-not-verified");
        }

        return issueSession(user);
    }

    @Override
    public AuthTokens refresh(String rawRefreshToken) {
        RefreshTokenService.Rotated rotated = refreshTokenService.rotate(rawRefreshToken);
        User user = userService.findById(rotated.userId());
        return new AuthTokens(accessTokenFor(user), rotated.newRawToken());
    }

    @Override
    public void logout(String rawRefreshToken) {
        refreshTokenService.revoke(rawRefreshToken);
    }

    @Override
    public MeResponse me(String userId) {
        User user = userService.findById(userId);
        List<String> roles = userDetailsService.loadUserByUsername(user.getUsername()).getAuthorities().stream()
                .map(a -> a.getAuthority().replaceFirst("^ROLE_", ""))
                .sorted()
                .toList();
        return new MeResponse(user.getId(), user.getUsername(), user.getFullName(), user.getEmail(),
                user.getPhone(), roles);
    }

    @Override
    public AuthTokens changePassword(String userId, ChangePasswordRequest request) {
        User user = userService.findById(userId);

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BusinessException("Current password is incorrect", HttpStatus.BAD_REQUEST);
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new BusinessException("New password must be different from the current password",
                    HttpStatus.BAD_REQUEST);
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userService.save(user);

        // Every other device is signed out; the caller gets a fresh session.
        refreshTokenService.revokeAllForUser(user.getId());
        return issueSession(user);
    }

    @Override
    public void signup(SignupRequest request) {
        if (userService.existByUserName(request.username())) {
            throw new ExistByFieldException(String.format(MessageConstant.ENTITY_ALREADY_EXISTS,
                    Constant.USER, Constant.USERNAME_FIELD));
        } else if (userService.findByEmail(request.email().trim()).isPresent()) {
            throw new ExistByFieldException(String.format(MessageConstant.ENTITY_ALREADY_EXISTS,
                    Constant.USER, Constant.EMAIL_FIELD));
        }

        Role roleDefault = roleService.findRoleByRoleName(Roles.STUDENT).orElseThrow(
                ()-> new ResourceNotFoundException(MessageConstant.STUDENT_ROLE_NOT_FOUND ));

        String encodePassword = passwordEncoder.encode(request.password());

        User user = User.builder()
                .email(request.email().trim().toLowerCase())
                .phone(request.phone())
                .status(UserStatus.ACTIVE)
                .emailVerified(false)
                .username(request.username())
                .fullName(request.fullName())
                .password(encodePassword)
                .build();

        userService.save(user);
        userRoleAssignmentService.assignRole(user.getId(), roleDefault.getId());
        emailVerificationService.sendCode(user.getEmail());
    }

    private AuthTokens issueSession(User user) {
        return new AuthTokens(accessTokenFor(user), refreshTokenService.issue(user.getId()));
    }

    private String accessTokenFor(User user) {
        UserDetails details;
        try {
            details = userDetailsService.loadUserByUsername(user.getUsername());
        } catch (UsernameNotFoundException ex) {
            // e.g. an account with no role assigned: it cannot hold a session.
            throw new UnauthorizedException("Account has no role assigned");
        }
        if (!(details instanceof AuthUserDetails) || !details.isEnabled() || !details.isAccountNonLocked()) {
            throw new UnauthorizedException(MessageConstant.USER_ACCOUNT_NOT_ACTIVE);
        }
        return jwtTokenProvider.generateAccessToken(details);
    }

    private synchronized String dummyHash() {
        if (dummyHash == null) {
            dummyHash = passwordEncoder.encode("not-a-real-password");
        }
        return dummyHash;
    }
}
