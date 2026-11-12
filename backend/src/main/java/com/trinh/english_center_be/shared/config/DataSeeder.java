package com.trinh.english_center_be.shared.config;

import com.trinh.english_center_be.modules.user.Repository.RoleRepository;
import com.trinh.english_center_be.modules.user.Repository.UserRepository;
import com.trinh.english_center_be.modules.user.entity.Role;
import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.shared.enums.Roles;
import com.trinh.english_center_be.shared.enums.UserStatus;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Makes a fresh database usable: creates the fixed roles (ADMIN, TEACHER, STUDENT) that are missing (signup needs
 * STUDENT) and, only when ADMIN_USERNAME / ADMIN_EMAIL / ADMIN_PASSWORD are all set, a first admin.
 * Idempotent; never overwrites existing roles or users.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    /** The only roles the system needs. Legacy TEACHER_* enum values are never created; teacher specialties are Categories. */
    private static final List<Roles> FIXED_ROLES = List.of(Roles.ADMIN, Roles.TEACHER, Roles.STUDENT);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_USERNAME:}")
    private String adminUsername;

    @Value("${ADMIN_EMAIL:}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD:}")
    private String adminPassword;

    @Override
    public void run(ApplicationArguments args) {
        for (Roles code : FIXED_ROLES) {
            if (!roleRepository.existsByCode(code)) {
                roleRepository.save(Role.builder().code(code).description(code.getLabel()).build());
                log.info("Seeded role {}", code);
            }
        }
        seedAdmin();
    }

    private void seedAdmin() {
        if (adminUsername.isBlank() || adminEmail.isBlank() || adminPassword.isBlank()) return;
        if (userRepository.existsByUsername(adminUsername)
                || userRepository.findByEmailIgnoreCase(adminEmail.trim()).isPresent()) {
            return;
        }
        Role adminRole = roleRepository.findByCode(Roles.ADMIN).orElseThrow();
        User admin = userRepository.save(User.builder()
                .username(adminUsername.trim())
                .email(adminEmail.trim().toLowerCase())
                .fullName("Administrator")
                .password(passwordEncoder.encode(adminPassword))
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .role(adminRole)
                .build());
        log.info("Seeded admin account '{}'", admin.getUsername());
    }
}
