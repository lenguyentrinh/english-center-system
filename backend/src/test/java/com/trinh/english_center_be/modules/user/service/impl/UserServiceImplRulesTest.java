package com.trinh.english_center_be.modules.user.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.trinh.english_center_be.modules.auth.service.EmailVerificationService;
import com.trinh.english_center_be.modules.auth.service.PasswordResetService;
import com.trinh.english_center_be.modules.auth.service.RefreshTokenService;
import com.trinh.english_center_be.modules.user.Repository.UserRepository;
import com.trinh.english_center_be.modules.user.dto.UserRequest;
import com.trinh.english_center_be.modules.user.dto.UserResponse;
import com.trinh.english_center_be.modules.user.dto.UserUpdateRequest;
import com.trinh.english_center_be.modules.user.entity.Role;
import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.modules.user.service.RoleProfileService;
import com.trinh.english_center_be.modules.user.service.RoleService;
import com.trinh.english_center_be.shared.enums.Roles;
import com.trinh.english_center_be.shared.enums.UserStatus;
import com.trinh.english_center_be.shared.exception.BusinessException;
import com.trinh.english_center_be.shared.response.PageResponse;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UserServiceImplRulesTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock RoleService roleService;
    @Mock RoleProfileService roleProfiles;
    @Mock RefreshTokenService refreshTokenService;
    @Mock EmailVerificationService emailVerificationService;
    @Mock PasswordResetService passwordResetService;

    UserServiceImpl service;
    User target;
    Role adminRole = Role.builder().id("r-admin").code(Roles.ADMIN).build();
    Role studentRole = Role.builder().id("r-student").code(Roles.STUDENT).build();

    @BeforeEach
    void setUp() {
        service = new UserServiceImpl(userRepository, passwordEncoder, roleService, roleProfiles,
                refreshTokenService, emailVerificationService, passwordResetService);
        target = User.builder().id("u2").username("target1").email("t@x.com").fullName("Target").phone("0123456789")
                .status(UserStatus.ACTIVE).emailVerified(true).active(true).build();
        lenient().when(userRepository.findById("u2")).thenReturn(Optional.of(target));
        lenient().when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private UserUpdateRequest update(String email, UserStatus status) {
        return new UserUpdateRequest("target1", email, "Target", "0123456789", status);
    }

    @Test
    void adminCannotLockOrDeleteThemself() {
        assertThatThrownBy(() -> service.update("u2", update("t@x.com", UserStatus.LOCKED), true, "u2"))
                .isInstanceOfSatisfying(BusinessException.class, e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
        assertThatThrownBy(() -> service.softDeleteById("u2", "u2")).isInstanceOf(BusinessException.class);
        verify(userRepository, never()).save(any());
        verify(refreshTokenService, never()).revokeAllForUser(any());
    }

    @Test
    void lastActiveAdminCannotBeLockedOrDeleted() {
        target.setRole(adminRole);
        when(userRepository.findByRole(adminRole)).thenReturn(List.of(target));

        assertThatThrownBy(() -> service.update("u2", update("t@x.com", UserStatus.INACTIVE), true, "someone-else"))
                .isInstanceOfSatisfying(BusinessException.class, e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.CONFLICT));
        assertThatThrownBy(() -> service.softDeleteById("u2", "someone-else")).isInstanceOf(BusinessException.class);
    }

    @Test
    void anAdminCanBeLockedWhileAnotherActiveAdminExists() {
        User other = User.builder().id("u3").status(UserStatus.ACTIVE).active(true).build();
        target.setRole(adminRole);
        when(userRepository.findByRole(adminRole)).thenReturn(List.of(target, other));

        service.update("u2", update("t@x.com", UserStatus.LOCKED), true, "u3");

        assertThat(target.getStatus()).isEqualTo(UserStatus.LOCKED);
    }

    @Test
    void lockingRevokesEverySessionAndUnlockingDoesNot() {
        service.update("u2", update("t@x.com", UserStatus.LOCKED), true, "admin-1");
        verify(refreshTokenService).revokeAllForUser("u2");

        org.mockito.Mockito.clearInvocations(refreshTokenService);
        service.update("u2", update("t@x.com", UserStatus.ACTIVE), true, "admin-1");
        verify(refreshTokenService, never()).revokeAllForUser(any());
    }

    @Test
    void deleteRevokesSessions() {
        service.softDeleteById("u2", "admin-1");

        assertThat(target.getActive()).isFalse();
        verify(refreshTokenService).revokeAllForUser("u2");
    }

    @Test
    void changingTheEmailMakesItUnverifiedAndMailsACodeToTheNewAddress() {
        when(userRepository.findByEmailIgnoreCase("New@X.com")).thenReturn(Optional.empty());

        service.update("u2", update("New@X.com", UserStatus.ACTIVE), true, "admin-1");

        assertThat(target.getEmail()).isEqualTo("new@x.com");
        assertThat(target.getEmailVerified()).isFalse();
        verify(emailVerificationService).sendCode("new@x.com");
    }

    @Test
    void keepingTheSameEmailKeepsItVerified() {
        service.update("u2", update("T@X.com", UserStatus.ACTIVE), true, "admin-1");

        assertThat(target.getEmailVerified()).isTrue();
        verify(emailVerificationService, never()).sendCode(any());
    }

    @Test
    void createSendsAnInviteCodeForActiveAccountsOnly() {
        when(passwordEncoder.encode("Passw0rd")).thenReturn("hash");
        when(userRepository.existsByUsername(any())).thenReturn(false);
        when(userRepository.findByEmailIgnoreCase(any())).thenReturn(Optional.empty());

        service.create(new UserRequest("newuser1", "Passw0rd", "N@x.com", "New User", "0901 234 567", UserStatus.ACTIVE, Roles.STUDENT));
        verify(passwordResetService).requestInvite("n@x.com");

        org.mockito.Mockito.clearInvocations(passwordResetService);
        service.create(new UserRequest("newuser2", "Passw0rd", "m@x.com", "New User", null, UserStatus.LOCKED, Roles.STUDENT));
        verify(passwordResetService, never()).requestInvite(any());
    }

    @Test
    void aFailingInviteMailDoesNotUndoTheCreate() {
        when(passwordEncoder.encode(any())).thenReturn("hash");
        when(userRepository.existsByUsername(any())).thenReturn(false);
        when(userRepository.findByEmailIgnoreCase(any())).thenReturn(Optional.empty());
        org.mockito.Mockito.doThrow(new IllegalStateException("smtp down")).when(passwordResetService).requestInvite(any());

        UserResponse res = service.create(new UserRequest("newuser1", "Passw0rd", "n@x.com", "New User", null, UserStatus.ACTIVE, Roles.STUDENT));

        assertThat(res.username()).isEqualTo("newuser1");
    }

    @Test
    void requestDtosNormalisePhoneAndBlankName() {
        UserUpdateRequest spaced = new UserUpdateRequest("target1", "t@x.com", "  ", "0901 234 567", null);
        assertThat(spaced.phone()).isEqualTo("0901234567");
        assertThat(spaced.fullName()).isNull();
        assertThat(new UserUpdateRequest("target1", "t@x.com", "Hà", "", null).phone()).isNull();
        assertThat(new UserRequest("newuser1", "Passw0rd", "n@x.com", "Hà", " 0901.234.567 ", UserStatus.ACTIVE, Roles.STUDENT).phone()).isEqualTo("0901234567");
    }

    @Test
    void findAllReturnsEachUsersRoleAndSkipsDeletedUsers() {
        User a = User.builder().id("a").username("alpha").active(true).status(UserStatus.ACTIVE).role(adminRole).build();
        User b = User.builder().id("b").username("bravo").active(true).status(UserStatus.ACTIVE).role(studentRole).build();
        User noRole = User.builder().id("c").username("charlie").active(true).status(UserStatus.ACTIVE).build();
        User deleted = User.builder().id("d").username("delta").active(false).build();
        when(userRepository.findAll()).thenReturn(List.of(a, b, noRole, deleted));

        List<UserResponse> all = service.findAll();

        assertThat(all).hasSize(3);
        assertThat(all.get(0).roles()).containsExactly("ADMIN");
        assertThat(all.get(1).roles()).containsExactly("STUDENT");
        assertThat(all.get(2).roles()).isEmpty();
    }

    @Test
    void searchFiltersByQueryRoleStatusAndPages() {
        LocalDateTime now = LocalDateTime.now();
        Role teacherRole = Role.builder().id("r-teacher").code(Roles.TEACHER).build();
        User t1 = User.builder().id("t1").username("teacher1").fullName("Nguyen Ha").email("ha@x.com").status(UserStatus.ACTIVE).active(true).createdAt(now).role(teacherRole).build();
        User t2 = User.builder().id("t2").username("teacher2").fullName("Tran Minh").email("minh@x.com").status(UserStatus.LOCKED).active(true).createdAt(now.minusDays(1)).role(teacherRole).build();
        User s1 = User.builder().id("s1").username("student1").fullName("Le Anh").email("anh@x.com").status(UserStatus.ACTIVE).active(true).createdAt(now.minusDays(2)).role(studentRole).build();
        when(userRepository.findAll()).thenReturn(List.of(s1, t2, t1));

        PageResponse<UserResponse> teachers = service.search(null, "teacher", null, 1, 10);
        assertThat(teachers.total()).isEqualTo(2);
        assertThat(teachers.items()).extracting(UserResponse::id).containsExactly("t1", "t2"); // newest first

        assertThat(service.search("MINH", null, null, 1, 10).items()).extracting(UserResponse::id).containsExactly("t2");
        assertThat(service.search(null, null, UserStatus.LOCKED, 1, 10).total()).isEqualTo(1);

        PageResponse<UserResponse> page2 = service.search(null, null, null, 2, 2);
        assertThat(page2.items()).hasSize(1);
        assertThat(page2.total()).isEqualTo(3);
        assertThat(page2.page()).isEqualTo(2);
    }

    @Test
    void createSetsTheRequestedRoleAndItsProfile() {
        when(userRepository.existsByUsername("newuser1")).thenReturn(false);
        when(userRepository.findByEmailIgnoreCase("n@x.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("Passw0rd")).thenReturn("hash");
        when(roleService.getByCode(Roles.TEACHER)).thenReturn(Role.builder().id("r-teacher").code(Roles.TEACHER).build());

        UserResponse created = service.create(new UserRequest("newuser1", "Passw0rd", "n@x.com", "New User", null,
                UserStatus.ACTIVE, Roles.TEACHER));

        assertThat(created.roles()).containsExactly("TEACHER");
        verify(roleProfiles).onAssigned(any(User.class), org.mockito.ArgumentMatchers.eq(Roles.TEACHER));
    }

    @Test
    void changeRoleReplacesTheOldRoleAndMovesTheProfile() {
        target.setRole(studentRole);
        when(roleService.getByCode(Roles.TEACHER)).thenReturn(Role.builder().id("r-teacher").code(Roles.TEACHER).build());

        UserResponse res = service.changeRole("u2", Roles.TEACHER, "admin-1");

        assertThat(res.roles()).containsExactly("TEACHER");
        verify(roleProfiles).onRemoved(target, Roles.STUDENT);
        verify(roleProfiles).onAssigned(target, Roles.TEACHER);
        verify(refreshTokenService).revokeAllForUser("u2");
    }

    @Test
    void changeRoleToTheSameRoleDoesNothing() {
        target.setRole(studentRole);

        service.changeRole("u2", Roles.STUDENT, "admin-1");

        verify(userRepository, never()).save(any());
        verify(roleProfiles, never()).onAssigned(any(), any());
    }

    @Test
    void theLastActiveAdminCannotLoseTheAdminRoleNorCanYouRemoveYourOwn() {
        target.setRole(adminRole);
        when(userRepository.findByRole(adminRole)).thenReturn(List.of(target));

        assertThatThrownBy(() -> service.changeRole("u2", Roles.STUDENT, "someone-else"))
                .isInstanceOfSatisfying(BusinessException.class, e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.CONFLICT));
        assertThatThrownBy(() -> service.changeRole("u2", Roles.STUDENT, "u2")).isInstanceOf(BusinessException.class);
        verify(userRepository, never()).save(any());
    }
}
