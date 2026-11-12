package com.trinh.english_center_be.modules.auth.service;

import com.trinh.english_center_be.modules.auth.service.MailTemplates.Kind;
import jakarta.annotation.PostConstruct;
import jakarta.mail.internet.MimeMessage;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Sends the OTP emails as HTML (built in {@link MailTemplates}) with a plain-text fallback. Runs {@link Async} so
 * response time does not reveal whether the email belongs to an account. Without SMTP config: dev logs the code to
 * the console, prod refuses to start (a silent no-op would make "forgot password" look like it works).
 */
@Slf4j
@Service
public class MailService {

    private final ObjectProvider<JavaMailSender> mailSender;
    private final Environment environment;

    @Value("${mail.from:no-reply@english-center.local}")
    private String from;

    @Value("${app.name:English Center}")
    private String appName;

    /** Base URL of the SPA, used for the button and footer links. */
    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${auth.otp.ttl-minutes:5}")
    private long otpTtlMinutes;

    public MailService(ObjectProvider<JavaMailSender> mailSender, Environment environment) {
        this.mailSender = mailSender;
        this.environment = environment;
    }

    @PostConstruct
    void verifyConfiguration() {
        if (mailSender.getIfAvailable() != null) return;
        if (environment.acceptsProfiles(Profiles.of("prod"))) {
            throw new IllegalStateException("SMTP is not configured (set MAIL_HOST etc.); required in production");
        }
        log.warn("SMTP is not configured: password reset codes will be printed to the log (dev only)");
    }

    @Async
    public void sendPasswordResetOtp(String to, String fullName, String otp) {
        send(Kind.RESET_PASSWORD, to, fullName, otp, "Mã đặt lại mật khẩu của bạn là: %s");
    }

    @Async
    public void sendAccountInviteOtp(String to, String fullName, String otp) {
        send(Kind.ACCOUNT_INVITE, to, fullName, otp,
                "Một tài khoản đã được tạo cho bạn. Hãy dùng mã này ở màn hình Quên mật khẩu để đặt mật khẩu: %s");
    }

    @Async
    public void sendEmailVerificationOtp(String to, String fullName, String otp) {
        send(Kind.VERIFY_EMAIL, to, fullName, otp, "Mã xác nhận email của bạn là: %s");
    }

    /** HTML body for {@code kind}; package-private so tests can check it without SMTP. */
    String render(Kind kind, String to, String fullName, String otp) {
        String appUrl = frontendUrl.replaceAll("/+$", "");
        String email = URLEncoder.encode(to, StandardCharsets.UTF_8);
        String ctaUrl = switch (kind) {
            case VERIFY_EMAIL -> appUrl + "/auth/verify-email?email=" + email;
            case RESET_PASSWORD -> appUrl + "/auth/forgot-password";
            case ACCOUNT_INVITE -> appUrl + "/auth/forgot-password?email=" + email;
        };
        return MailTemplates.render(kind, appName, fullName, otp, otpTtlMinutes, ctaUrl, appUrl);
    }

    private void send(Kind kind, String to, String fullName, String otp, String codeLine) {
        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null) {
            log.warn("[DEV MAIL] {} for {}: {}", kind.title, to, otp);
            return;
        }

        try {
            String text = "Xin chào %s,\n\n%s\n\nMã có hiệu lực trong %d phút. %s\n".formatted(
                    MailTemplates.displayName(fullName), codeLine.formatted(otp), otpTtlMinutes, kind.note);
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(appName + " - " + kind.title);
            helper.setText(text, render(kind, to, fullName, otp));
            sender.send(message);
        } catch (Exception ex) {
            // Never surface to the caller: that would reveal which emails have accounts.
            log.error("Failed to send {} email to {}", kind.title, to, ex);
        }
    }
}
