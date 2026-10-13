package com.trinh.english_center_be.modules.auth.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.trinh.english_center_be.modules.auth.entity.EmailVerificationOtp;
import com.trinh.english_center_be.modules.auth.service.MailService;
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
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class EmailVerificationServiceImplTest {

    @Mock UserService userService;
    @Mock MailService mailService;
    @Mock MongoTemplate mongoTemplate;

    EmailVerificationServiceImpl service;
    User user;
    String lastHash;

    @BeforeEach
    void setUp() {
        service = new EmailVerificationServiceImpl(userService, mailService, mongoTemplate);
        ReflectionTestUtils.setField(service, "ttlMinutes", 5L);
        ReflectionTestUtils.setField(service, "otpSecret", "unit-test-secret-unit-test-secret!!");
        user = User.builder().id("u1").email("a@b.com").fullName("A B").status(UserStatus.ACTIVE)
                .emailVerified(false).build();
    }

    private String sendAndCapture() {
        when(userService.findByEmail("a@b.com")).thenReturn(Optional.of(user));
        service.sendCode("a@b.com");
        ArgumentCaptor<String> otp = ArgumentCaptor.forClass(String.class);
        verify(mailService).sendEmailVerificationOtp(eq("a@b.com"), eq("A B"), otp.capture());
        ArgumentCaptor<Update> update = ArgumentCaptor.forClass(Update.class);
        verify(mongoTemplate).upsert(any(Query.class), update.capture(), eq(EmailVerificationOtp.class));
        lastHash = (String) update.getValue().getUpdateObject().get("$set", org.bson.Document.class).get("otpHash");
        return otp.getValue();
    }

    private EmailVerificationOtp row(int attempts, Instant expiresAt) {
        return EmailVerificationOtp.builder().userId("u1").otpHash(lastHash).attempts(attempts)
                .expiresAt(expiresAt).build();
    }

    private void stubAttemptCounter(EmailVerificationOtp row) {
        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class), any(FindAndModifyOptions.class),
                eq(EmailVerificationOtp.class))).thenReturn(row);
    }

    @Test
    void sendsNothingForAlreadyVerifiedAccounts() {
        user.setEmailVerified(true);
        when(userService.findByEmail("a@b.com")).thenReturn(Optional.of(user));

        service.sendCode("a@b.com");

        verify(mailService, never()).sendEmailVerificationOtp(anyString(), anyString(), anyString());
    }

    @Test
    void sendsNothingForUnknownEmail() {
        when(userService.findByEmail("x@y.com")).thenReturn(Optional.empty());

        service.sendCode("x@y.com");

        verify(mailService, never()).sendEmailVerificationOtp(anyString(), anyString(), anyString());
    }

    @Test
    void legacyAccountsWithoutTheFlagCountAsVerified() {
        user.setEmailVerified(null);
        assertThat(user.isEmailVerified()).isTrue();
    }

    @Test
    void correctCodeConsumesItAndMarksTheEmailVerified() {
        String otp = sendAndCapture();
        EmailVerificationOtp stored = row(1, Instant.now().plusSeconds(60));
        stubAttemptCounter(stored);
        when(mongoTemplate.findAndRemove(any(Query.class), eq(EmailVerificationOtp.class))).thenReturn(stored);

        service.verify("a@b.com", otp);

        assertThat(user.isEmailVerified()).isTrue();
        verify(userService).save(user);
    }

    @Test
    void wrongCodeIsRejectedAndNothingIsSaved() {
        String otp = sendAndCapture();
        stubAttemptCounter(row(1, Instant.now().plusSeconds(60)));
        String wrong = otp.equals("000000") ? "000001" : "000000";

        assertThatThrownBy(() -> service.verify("a@b.com", wrong)).isInstanceOf(BusinessException.class);

        verify(userService, never()).save(any(User.class));
    }

    @Test
    void codeIsDeadAfterTooManyAttemptsEvenIfCorrect() {
        String otp = sendAndCapture();
        stubAttemptCounter(row(6, Instant.now().plusSeconds(60)));

        assertThatThrownBy(() -> service.verify("a@b.com", otp)).isInstanceOf(BusinessException.class);

        verify(userService, never()).save(any(User.class));
    }

    @Test
    void expiredCodeIsRejected() {
        String otp = sendAndCapture();
        stubAttemptCounter(row(1, Instant.now().minusSeconds(1)));

        assertThatThrownBy(() -> service.verify("a@b.com", otp)).isInstanceOf(BusinessException.class);
    }

    @Test
    void concurrentRequestThatLostTheConsumeRaceIsRejected() {
        String otp = sendAndCapture();
        stubAttemptCounter(row(1, Instant.now().plusSeconds(60)));
        when(mongoTemplate.findAndRemove(any(Query.class), eq(EmailVerificationOtp.class))).thenReturn(null);

        assertThatThrownBy(() -> service.verify("a@b.com", otp)).isInstanceOf(BusinessException.class);

        verify(userService, never()).save(any(User.class));
    }

    @Test
    void verifyingAnUnknownEmailGivesTheSameGenericError() {
        when(userService.findByEmail("x@y.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.verify("x@y.com", "123456"))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Invalid or expired code");
    }
}
