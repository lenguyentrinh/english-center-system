package com.trinh.english_center_be.modules.user.service.impl;

import com.trinh.english_center_be.modules.auth.service.EmailVerificationService;
import com.trinh.english_center_be.modules.auth.service.PasswordResetService;
import com.trinh.english_center_be.modules.auth.service.RefreshTokenService;
import com.trinh.english_center_be.modules.user.Repository.RoleRepository;
import com.trinh.english_center_be.modules.user.Repository.UserRepository;
import com.trinh.english_center_be.modules.user.Repository.UserRoleRepository;
import com.trinh.english_center_be.modules.user.dto.UserRequest;
import com.trinh.english_center_be.modules.user.dto.UserResponse;
import com.trinh.english_center_be.modules.user.dto.UserUpdateRequest;
import com.trinh.english_center_be.modules.user.entity.Role;
import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.modules.user.entity.UserRole;
import com.trinh.english_center_be.modules.user.mapper.UserMapper;
import com.trinh.english_center_be.modules.user.service.UserService;
import com.trinh.english_center_be.shared.enums.Roles;
import com.trinh.english_center_be.shared.enums.UserStatus;
import com.trinh.english_center_be.shared.exception.BusinessException;
import com.trinh.english_center_be.shared.exception.ExistByFieldException;
import com.trinh.english_center_be.shared.exception.ResourceNotFoundException;
import com.trinh.english_center_be.shared.response.PageResponse;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class UserServiceImpl implements UserService {
    private static final int MAX_PAGE_SIZE = 100;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    // The auth services depend on UserService themselves, so they are injected lazily to avoid a cycle.
    private final RefreshTokenService refreshTokenService;
    private final EmailVerificationService emailVerificationService;
    private final PasswordResetService passwordResetService;

    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           UserRoleRepository userRoleRepository,
                           RoleRepository roleRepository,
                           @Lazy RefreshTokenService refreshTokenService,
                           @Lazy EmailVerificationService emailVerificationService,
                           @Lazy PasswordResetService passwordResetService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userRoleRepository = userRoleRepository;
        this.roleRepository = roleRepository;
        this.refreshTokenService = refreshTokenService;
        this.emailVerificationService = emailVerificationService;
        this.passwordResetService = passwordResetService;
    }

    private static boolean isLive(User u) {
        return !Boolean.FALSE.equals(u.getActive());
    }

    // CRUD Operations
    @Override
    public List<UserResponse> findAll() {
        List<User> live = userRepository.findAll().stream().filter(UserServiceImpl::isLive).toList();
        Map<String, List<String>> roles = rolesByUserId(live);
        return live.stream().map(u -> UserMapper.toResponse(u, roles.getOrDefault(u.getId(), List.of()))).toList();
    }

    @Override
    public PageResponse<UserResponse> search(String q, String role, UserStatus status, int page, int size) {
        int pageSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        int pageNo = Math.max(page, 1);
        String needle = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);
        String wantedRole = role == null || role.isBlank() ? null : role.trim().toUpperCase(Locale.ROOT);

        List<User> live = userRepository.findAll().stream().filter(UserServiceImpl::isLive).toList();
        Map<String, List<String>> roles = rolesByUserId(live);

        List<UserResponse> matches = live.stream()
                .filter(u -> status == null || u.getStatus() == status)
                .filter(u -> needle.isEmpty() || contains(u.getFullName(), needle) || contains(u.getUsername(), needle) || contains(u.getEmail(), needle))
                .filter(u -> wantedRole == null || roles.getOrDefault(u.getId(), List.of()).stream()
                        .anyMatch(r -> r.equals(wantedRole) || (wantedRole.equals("TEACHER") && r.startsWith("TEACHER"))))
                .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.<LocalDateTime>reverseOrder())))
                .map(u -> UserMapper.toResponse(u, roles.getOrDefault(u.getId(), List.of())))
                .toList();

        int from = Math.min((pageNo - 1) * pageSize, matches.size());
        int to = Math.min(from + pageSize, matches.size());
        return new PageResponse<>(matches.subList(from, to), matches.size(), pageNo, pageSize);
    }

    private static boolean contains(String value, String needle) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(needle);
    }

    @Override
    public UserResponse findByIdResponse(String id) {
        User user = findById(id);
        return UserMapper.toResponse(user, rolesByUserId(List.of(user)).getOrDefault(user.getId(), List.of()));
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
        sendInvite(savedUser);
        return UserMapper.toResponse(savedUser);
    }

    /**
     * Emails a password-setup code (usable on the forgot-password screen) so the admin never has to hand the
     * chosen password over. A mail problem must not undo the account creation.
     */
    private void sendInvite(User user) {
        if (user.getStatus() != UserStatus.ACTIVE) return;
        try {
            passwordResetService.requestInvite(user.getEmail());
        } catch (RuntimeException ex) {
            log.warn("Could not send the invite code to {}", user.getEmail(), ex);
        }
    }

    @Override
    public UserResponse update(String id, UserUpdateRequest request, boolean admin, String actingUserId) {
        User user = findById(id);

        if (!request.username().equals(user.getUsername()) && existByUserName(request.username())) {
            throw new ExistByFieldException(
                    String.format(MessageConstant.FIELD_ALREADY_VALUE, Constant.USERNAME_FIELD, request.username())
            );
        }

        boolean emailChanged = false;
        // Changing the email is admin-only. The new address starts unverified (a code is mailed to it after saving),
        // and the existing login rule then blocks sign-in until it is verified, so a typo cannot hand the account over.
        if (admin && (user.getEmail() == null || !request.email().equalsIgnoreCase(user.getEmail()))) {
            if (existByEmail(request.email())) {
                throw new ExistByFieldException(
                        String.format(MessageConstant.FIELD_ALREADY_VALUE, Constant.EMAIL_FIELD, request.email())
                );
            }
            emailChanged = true;
        }

        // A user must not be able to reactivate or otherwise change their own account state.
        boolean deactivating = false;
        if (admin && request.status() != null) {
            deactivating = isActiveStatus(user.getStatus()) && request.status() != UserStatus.ACTIVE;
            if (deactivating) refuseSelfOrLastAdmin(user, actingUserId, "lock or deactivate");
        }

        user.setUsername(request.username());
        user.setFullName(request.fullName());
        user.setPhone(request.phone());
        if (admin && request.status() != null) user.setStatus(request.status());
        if (emailChanged) {
            user.setEmail(request.email().trim().toLowerCase());
            user.setEmailVerified(false);
        }

        User saved = userRepository.save(user);
        if (deactivating) refreshTokenService.revokeAllForUser(saved.getId());
        if (emailChanged) emailVerificationService.sendCode(saved.getEmail());

        return UserMapper.toResponse(saved, rolesByUserId(List.of(saved)).getOrDefault(saved.getId(), List.of()));
    }

    @Override
    public void softDeleteById(String id, String actingUserId) {
        User user = findById(id);
        refuseSelfOrLastAdmin(user, actingUserId, "delete");
        user.setActive(false);
        userRepository.save(user);
        refreshTokenService.revokeAllForUser(id);
    }

    /** A legacy null status counts as ACTIVE (see CustomUserDetailsService). */
    private static boolean isActiveStatus(UserStatus status) {
        return status == null || status == UserStatus.ACTIVE;
    }

    /** Nobody may lock out or delete themself, and the last active admin must always stay usable. */
    private void refuseSelfOrLastAdmin(User target, String actingUserId, String action) {
        if (actingUserId != null && actingUserId.equals(target.getId())) {
            throw new BusinessException("You cannot " + action + " your own account", HttpStatus.BAD_REQUEST);
        }
        Optional<Role> adminRole = roleRepository.findByCode(Roles.ADMIN);
        if (adminRole.isEmpty() || !userRoleRepository.existsByUserIdAndRoleId(target.getId(), adminRole.get().getId())) {
            return;
        }
        long activeAdmins = userRoleRepository.findByRoleId(adminRole.get().getId()).stream()
                .map(UserRole::getUserId)
                .distinct()
                .map(userRepository::findById)
                .flatMap(Optional::stream)
                .filter(u -> isLive(u) && isActiveStatus(u.getStatus()))
                .count();
        if (activeAdmins <= 1) {
            throw new BusinessException("Cannot " + action + " the last active admin", HttpStatus.CONFLICT);
        }
    }

    /** One user_roles query plus one roles query for the whole batch (no per-user lookups). */
    private Map<String, List<String>> rolesByUserId(Collection<User> users) {
        List<String> userIds = users.stream().map(User::getId).filter(Objects::nonNull).toList();
        if (userIds.isEmpty()) return Map.of();

        List<UserRole> links = userRoleRepository.findByUserIdIn(userIds);
        List<String> roleIds = links.stream().map(UserRole::getRoleId).distinct().toList();
        Map<String, String> codeByRoleId = new HashMap<>();
        if (!roleIds.isEmpty()) {
            roleRepository.findAllById(roleIds).forEach(r -> {
                if (r.getCode() != null) codeByRoleId.put(r.getId(), r.getCode().name());
            });
        }
        return links.stream()
                .filter(l -> codeByRoleId.containsKey(l.getRoleId()))
                .collect(Collectors.groupingBy(UserRole::getUserId,
                        Collectors.mapping(l -> codeByRoleId.get(l.getRoleId()), Collectors.collectingAndThen(Collectors.toSet(),
                                set -> set.stream().sorted().toList()))));
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
                .map(user -> isLive(user) && user.getStatus() == UserStatus.ACTIVE)
                .orElse(false);
    }

    @Override
    public boolean existByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email.trim()).isPresent();
    }
}
