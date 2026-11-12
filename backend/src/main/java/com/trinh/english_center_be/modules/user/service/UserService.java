package com.trinh.english_center_be.modules.user.service;

import com.trinh.english_center_be.modules.user.dto.UserRequest;
import com.trinh.english_center_be.modules.user.dto.UserResponse;
import com.trinh.english_center_be.modules.user.dto.UserUpdateRequest;
import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.shared.enums.Roles;
import com.trinh.english_center_be.shared.enums.UserStatus;
import com.trinh.english_center_be.shared.response.PageResponse;

import java.util.List;
import java.util.Optional;

public interface UserService {
    // CRUD Operations
    List<UserResponse> findAll();
    UserResponse findByIdResponse(String id);

    /**
     * Searches live users, newest first. {@code role}: ADMIN, STUDENT, TEACHER or any role code. All filters are optional. {@code page} is 1-based; {@code size} is capped at 100.
     */
    PageResponse<UserResponse> search(String q, String role, UserStatus status, int page, int size);

    /** Creates the account and, when ACTIVE, emails a password-setup code so no password has to be shared. */
    UserResponse create(UserRequest request);

    /**
     * @param admin        only admins may change {@code status} and {@code email}; for others those fields are ignored.
     * @param actingUserId the caller's id, used to refuse self-lockout (null skips that check)
     */
    UserResponse update(String id, UserUpdateRequest request, boolean admin, String actingUserId);

    default UserResponse update(String id, UserUpdateRequest request, boolean admin) {
        return update(id, request, admin, null);
    }

    /**
     * Gives the user exactly one role (replacing the old one), keeping the Teacher/Student profile in step and
     * ending the user's sessions. Refuses to take the admin role from yourself or from the last active admin.
     */
    UserResponse changeRole(String id, Roles newRole, String actingUserId);

    void softDeleteById(String id, String actingUserId);

    default void softDeleteById(String id) {
        softDeleteById(id, null);
    }

    // Existing methods
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existByUserName(String username);
    User findById(String id);
    void save(User user);
    boolean isUserActive(String id);
    boolean existByEmail(String email);
}
