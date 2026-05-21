package com.trinh.english_center_be.modules.auth.service;

import com.trinh.english_center_be.modules.auth.dto.LoginRequest;
import com.trinh.english_center_be.modules.auth.dto.SignupRequest;
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
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService{
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final RoleService roleService;
    private final UserRoleAssignmentService userRoleAssignmentService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public String authenticate(LoginRequest loginRequest) {
        var user = userService.findByUsername(loginRequest.username())
                .orElseThrow(() -> new InvalidCredentialException("Incorrect username", "auth.username"));

        if (!passwordEncoder.matches(loginRequest.password(), user.getPassword())) {
            throw new InvalidCredentialException("Incorrect password", "auth.password");
        }

        if(user.getStatus() != UserStatus.ACTIVE) throw new UnauthorizedException(MessageConstant.USER_ACCOUNT_NOT_ACTIVE);

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.username(), loginRequest.password()));

            return jwtTokenProvider.generateToken(authentication);
        } catch (BadCredentialsException ex) {
            throw new InvalidCredentialException("Incorrect password", "auth.password");
        } catch (AuthenticationException ex) {
            throw new UnauthorizedException("Authentication failed");
        }
    }

    @Override
    public void signup(SignupRequest request) {
        if (userService.existByUserName(request.username())) {
            throw new EntityExistsException(String.format(MessageConstant.ENTITY_ALREADY_EXISTS, Constant.USER, Constant.USERNAME_FIELD));
        } else if (userService.existByEmail(request.email())) {
            throw new EntityExistsException(String.format(MessageConstant.ENTITY_ALREADY_EXISTS, Constant.USER, Constant.EMAIL_FIELD));
        }

        Role roleDefault = roleService.findRoleByRoleName(Roles.STUDENT).orElseThrow(
                ()-> new ResourceNotFoundException(MessageConstant.STUDENT_ROLE_NOT_FOUND ));

        String encodePassword = passwordEncoder.encode(request.password());

        User user = User.builder()
                .email(request.email())
                .phone(request.phone())
                .status(UserStatus.ACTIVE)
                .username(request.username())
                .fullName(request.fullName())
                .password(encodePassword)
                .build();

        userService.save(user);
        userRoleAssignmentService.assignRole(user.getId(), roleDefault.getId());
    }
}
