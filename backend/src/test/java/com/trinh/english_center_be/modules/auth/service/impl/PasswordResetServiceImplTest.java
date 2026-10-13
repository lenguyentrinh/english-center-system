package com.trinh.english_center_be.modules.auth.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.trinh.english_center_be.modules.auth.dto.ResetPasswordRequest;
import com.trinh.english_center_be.modules.auth.entity.PasswordResetOtp;
import com.trinh.english_center_be.modules.auth.service.MailService;
import com.trinh.english_center_be.modules.auth.service.RefreshTokenService;
import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.modules.user.service.UserService;
import com.trinh.english_center_be.shared.enums.UserStatus;
import com.trinh.english_center_be.shared.exception.BusinessException;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceImplTest {

    @Mock UserService userService;
    @Mock MailService mailService;
    @Mock RefreshTokenService refreshTokenService;
    @Mock PasswordEncoder passwordEncoder;
    @Mock MongoTemplate mongoTemplate;

    PasswordResetServiceImpl service;
    User user;
    String lastHash;

    @BeforeEach
    void setUp() {
        service = new PasswordResetServiceImpl(userService, mailService, refreshTokenService, passwordEncoder, mongoTemplate);
        ReflectionTestUtils.setField(service, "ttlMinutes", 5L);
        ReflectionTestUtils.setField(service, "otpSecret", "unit-test-secret-unit-test-secret!!");

        user = User.builder().id("u1").email("a@b.com").fullName("A B").password("old-hash")
                .status(UserStatus.ACTIVE).build();
    }

    /** Runs requestReset and returns the plaintext code that would have been emailed. */
    private String requestCode() {
        when(userService.findByEmail("a@b.com")).thenReturn(Optional.of(user));
        service.requestReset("a@b.com");
        ArgumentCaptor<String> otp = ArgumentCaptor.forClass(String.class);
        verify(mailService).sendPasswordResetOtp(eq("a@b.com"), eq("A B"), otp.capture());

        ArgumentCaptor<Update> update = ArgumentCaptor.forClass(Update.class);
        verify(mongoTemplate).upsert(any(Query.class), update.capture(), eq(PasswordResetOtp.class));
        lastHash = (String) update.getValue().getUpdateObject().get("$set", org.bson.Document.class).get("otpHash");
        return otp.getValue();
    }

    private PasswordResetOtp row(String otp, int attempts, Instant expiresAt) {
        return PasswordResetOtp.builder().userId("u1").otpHash(lastHash).attempts(attempts).expiresAt(expiresAt).build();
    }

    @Test
    void requestForUnknownEmailDoesNothing() {
        when(userService.findByEmail("x@y.com")).thenReturn(Optional.empty());

        service.requestReset("x@y.com");

        verify(mailService, never()).sendPasswordResetOtp(anyString(), anyString(), anyString());
        verify(mongoTemplate, never()).upsert(any(Query.class), any(Update.class), eq(PasswordResetOtp.class));
    }

    @Test
    void requestForLockedAccountDoesNothing() {
        user.setStatus(UserStatus.LOCKED);
        when(userService.findByEmail("a@b.com")).thenReturn(Optional.of(user));

        service.requestReset("a@b.com");

        verify(mailService, never()).sendPasswordResetOtp(anyString(), anyString(), anyString());
    }

    @Test
    void requestWithinCooldownDoesNotSendAgain() {
        when(userService.findByEmail("a@b.com")).thenReturn(Optional.of(user));
        when(mongoTemplate.findOne(any(Query.class), eq(PasswordResetOtp.class)))
                .thenReturn(PasswordResetOtp.builder().lastSentAt(Instant.now().minusSeconds(10)).build());

        service.requestReset("a@b.com");

        verify(mailService, never()).sendPasswordResetOtp(anyString(), anyString(), anyString());
    }

    @Test
    void storedValueIsAHashAndNeverThePlainCode() {
        String otp = requestCode();

        assertThat(otp).matches("\\d{6}");
        assertThat(lastHash).hasSize(64).isNotEqualTo(otp);
    }

    @Test
    void verifyAcceptsTheCorrectCodeWithoutConsumingIt() {
        String otp = requestCode();
        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class), any(FindAndModifyOptions.class),
                eq(PasswordResetOtp.class))).thenReturn(row(otp, 1, Instant.now().plusSeconds(60)));

        service.verifyOtp("a@b.com", otp);

        verify(mongoTemplate, never()).findAndRemove(any(Query.class), eq(PasswordResetOtp.class));
    }

    @Test
    void verifyRejectsAWrongCode() {
        String otp = requestCode();
        String wrong = otp.equals("000000") ? "000001" : "000000";
        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class), any(FindAndModifyOptions.class),
                eq(PasswordResetOtp.class))).thenReturn(row(otp, 1, Instant.now().plusSeconds(60)));

        assertThatThrownBy(() -> service.verifyOtp("a@b.com", wrong)).isInstanceOf(BusinessException.class);
    }

    @Test
    void codeIsDeadOnceAttemptsAreExhaustedEvenIfCorrect() {
        String otp = requestCode();
        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class), any(FindAndModifyOptions.class),
                eq(PasswordResetOtp.class))).thenReturn(row(otp, 6, Instant.now().plusSeconds(60)));

        assertThatThrownBy(() -> service.verifyOtp("a@b.com", otp)).isInstanceOf(BusinessException.class);
    }

    @Test
    void expiredCodeIsRejected() {
        String otp = requestCode();
        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class), any(FindAndModifyOptions.class),
                eq(PasswordResetOtp.class))).thenReturn(row(otp, 1, Instant.now().minusSeconds(1)));

        assertThatThrownBy(() -> service.verifyOtp("a@b.com", otp)).isInstanceOf(BusinessException.class);
    }

    @Test
    void unknownEmailGetsTheSameErrorAsAWrongCode() {
        when(userService.findByEmail("x@y.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.verifyOtp("x@y.com", "123456"))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Invalid or expired code");
    }

    @Test
    void resetConsumesTheCodeChangesThePasswordAndRevokesSessions() {
        String otp = requestCode();
        PasswordResetOtp stored = row(otp, 1, Instant.now().plusSeconds(60));
        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class), any(FindAndModifyOptions.class),
                eq(PasswordResetOtp.class))).thenReturn(stored);
        when(passwordEncoder.matches("newpass1", "old-hash")).thenReturn(false);
        when(passwordEncoder.encode("newpass1")).thenReturn("new-hash");
        when(mongoTemplate.findAndRemove(any(Query.class), eq(PasswordResetOtp.class))).thenReturn(stored);

        service.resetPassword(new ResetPasswordRequest("a@b.com", otp, "newpass1"));

        assertThat(user.getPassword()).isEqualTo("new-hash");
        verify(userService).save(user);
        verify(refreshTokenService).revokeAllForUser("u1");
    }

    @Test
    void resetFailsWhenAConcurrentRequestAlreadyConsumedTheCode() {
        String otp = requestCode();
        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class), any(FindAndModifyOptions.class),
                eq(PasswordResetOtp.class))).thenReturn(row(otp, 1, Instant.now().plusSeconds(60)));
        when(passwordEncoder.matches("newpass1", "old-hash")).thenReturn(false);
        when(mongoTemplate.findAndRemove(any(Query.class), eq(PasswordResetOtp.class))).thenReturn(null);

        assertThatThrownBy(() -> service.resetPassword(new ResetPasswordRequest("a@b.com", otp, "newpass1")))
                .isInstanceOf(BusinessException.class);

        verify(userService, never()).save(any(User.class));
        verify(refreshTokenService, never()).revokeAllForUser(anyString());
    }

    @Test
    void resetRejectsReusingTheCurrentPassword() {
        String otp = requestCode();
        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class), any(FindAndModifyOptions.class),
                eq(PasswordResetOtp.class))).thenReturn(row(otp, 1, Instant.now().plusSeconds(60)));
        when(passwordEncoder.matches("samepass1", "old-hash")).thenReturn(true);

        assertThatThrownBy(() -> service.resetPassword(new ResetPasswordRequest("a@b.com", otp, "samepass1")))
                .isInstanceOf(BusinessException.class);

        verify(mongoTemplate, never()).findAndRemove(any(Query.class), eq(PasswordResetOtp.class));
    }
}
