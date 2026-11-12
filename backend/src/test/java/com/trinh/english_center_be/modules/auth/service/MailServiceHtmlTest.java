package com.trinh.english_center_be.modules.auth.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

import com.trinh.english_center_be.modules.auth.service.MailTemplates.Kind;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.env.Environment;
import org.springframework.test.util.ReflectionTestUtils;

class MailServiceHtmlTest {

    private MailService mailService;

    @SuppressWarnings("unchecked")
    @BeforeEach
    void setUp() {
        mailService = new MailService(mock(ObjectProvider.class), mock(Environment.class));
        ReflectionTestUtils.setField(mailService, "appName", "English Center");
        ReflectionTestUtils.setField(mailService, "frontendUrl", "http://localhost:5173/");
        ReflectionTestUtils.setField(mailService, "otpTtlMinutes", 5L);
    }

    @Test
    void verifyEmailShowsNameOtpAndLink() {
        String html = mailService.render(Kind.VERIFY_EMAIL, "a+b@x.com", "Nguyễn Văn A", "123456");
        assertTrue(html.contains("Nguyễn Văn A"));
        assertTrue(html.contains("123456"));
        assertTrue(html.contains("http://localhost:5173/auth/verify-email?email=a%2Bb%40x.com"));
        assertTrue(html.contains("Hết hạn sau <strong style=\"color:#334155\">5 phút</strong>"));
    }

    @Test
    void resetPasswordShowsNameOtpAndLink() {
        String html = mailService.render(Kind.RESET_PASSWORD, "a@x.com", "Trần Thị B", "654321");
        assertTrue(html.contains("Trần Thị B"));
        assertTrue(html.contains("654321"));
        assertTrue(html.contains("href=\"http://localhost:5173/auth/forgot-password\""));
        assertTrue(html.contains("đừng chia sẻ mã này"));
    }

    @Test
    void accountInviteShowsNameOtpAndLink() {
        String html = mailService.render(Kind.ACCOUNT_INVITE, "a@x.com", "Lê C", "246810");
        assertTrue(html.contains("Lê C"));
        assertTrue(html.contains("246810"));
        assertTrue(html.contains("http://localhost:5173/auth/forgot-password?email=a%40x.com"));
        assertTrue(html.contains("Các bước"));
    }

    @Test
    void blankNameFallsBackToBan() {
        String html = mailService.render(Kind.VERIFY_EMAIL, "a@x.com", "  ", "111111");
        assertTrue(html.contains("<strong style=\"color:#020617\">bạn</strong>"));
    }

    @Test
    void userInputIsEscapedAndNeverLeavesPlaceholders() {
        String html = mailService.render(Kind.VERIFY_EMAIL, "a@x.com", "<script>alert(1)</script>{{otp}}", "1");
        assertFalse(html.contains("<script>"));
        assertTrue(html.contains("&lt;script&gt;"));
        assertFalse(html.contains("{{appName}}"));
        assertFalse(html.contains("{{extra}}"));
    }
}
