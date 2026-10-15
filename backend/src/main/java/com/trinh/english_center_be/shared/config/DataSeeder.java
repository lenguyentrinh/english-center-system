package com.trinh.english_center_be.shared.config;

import com.trinh.english_center_be.modules.category.entity.Category;
import com.trinh.english_center_be.modules.category.repository.CategoryRepository;
import com.trinh.english_center_be.modules.user.Repository.RoleRepository;
import com.trinh.english_center_be.modules.user.Repository.UserRepository;
import com.trinh.english_center_be.modules.user.Repository.UserRoleRepository;
import com.trinh.english_center_be.modules.user.entity.Role;
import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.modules.user.entity.UserRole;
import com.trinh.english_center_be.shared.enums.Roles;
import com.trinh.english_center_be.shared.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Makes a fresh database usable: creates every {@link Roles} document that is missing (signup needs
 * STUDENT) and, only when ADMIN_USERNAME / ADMIN_EMAIL / ADMIN_PASSWORD are all set, a first admin.
 * Idempotent; never overwrites existing roles or users.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoryRepository categoryRepository;

    @Value("${ADMIN_USERNAME:}")
    private String adminUsername;

    @Value("${ADMIN_EMAIL:}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD:}")
    private String adminPassword;

    @Override
    public void run(ApplicationArguments args) {
        for (Roles code : Roles.values()) {
            if (!roleRepository.existsByCode(code)) {
                roleRepository.save(Role.builder().code(code).description(code.getLabel()).build());
                log.info("Seeded role {}", code);
            }
        }
        seedAdmin();
        seedCategories();
    }

    /** Editable examples for an empty install only; once any category exists the admin owns the list. */
    private void seedCategories() {
        if (categoryRepository.count() > 0) return;
        String[][] examples = {{"IELTS", "#2563eb"}, {"TOEIC", "#0891b2"}, {"Giao tiếp", "#059669"}};
        for (String[] e : examples) {
            categoryRepository.save(Category.builder().name(e[0]).nameKey(e[0].toLowerCase()).color(e[1]).build());
        }
        log.info("Seeded {} example categories", examples.length);
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
                .build());
        userRoleRepository.save(UserRole.builder().userId(admin.getId()).roleId(adminRole.getId()).build());
        log.info("Seeded admin account '{}'", admin.getUsername());
    }
}
