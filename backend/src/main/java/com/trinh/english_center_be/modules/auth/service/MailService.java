package com.trinh.english_center_be.modules.auth.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Sends the password-reset code. Runs {@link Async} so response time does not reveal whether the
 * email belongs to an account. Without SMTP config: dev logs the code to the console, prod refuses
 * to start (a silent no-op would make "forgot password" look like it works).
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
        send(to, fullName, otp, "password reset code", "Your password reset code is: %s",
                "If you did not request it, ignore this email; your password has not been changed.");
    }

    @Async
    public void sendAccountInviteOtp(String to, String fullName, String otp) {
        send(to, fullName, otp, "account setup code",
                "An account was created for you. Use this code on the Forgot password screen to choose your password: %s",
                "If you were not expecting this, ignore this email.");
    }

    @Async
    public void sendEmailVerificationOtp(String to, String fullName, String otp) {
        send(to, fullName, otp, "email verification code", "Your email verification code is: %s",
                "If you did not create an account, ignore this email.");
    }

    private void send(String to, String fullName, String otp, String subject, String codeLine, String footer) {
        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null) {
            log.warn("[DEV MAIL] {} for {}: {}", subject, to, otp);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(appName + " - " + subject);
            message.setText("Hello %s,\n\n%s\n\nThe code expires in %d minutes. %s\n".formatted(
                    fullName == null || fullName.isBlank() ? "there" : fullName,
                    codeLine.formatted(otp), otpTtlMinutes, footer));
            sender.send(message);
        } catch (Exception ex) {
            // Never surface to the caller: that would reveal which emails have accounts.
            log.error("Failed to send {} email to {}", subject, to, ex);
        }
    }
}
