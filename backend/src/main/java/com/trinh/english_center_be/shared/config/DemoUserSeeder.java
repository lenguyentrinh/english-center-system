package com.trinh.english_center_be.shared.config;

import com.trinh.english_center_be.modules.student.entity.Student;
import com.trinh.english_center_be.modules.student.repository.StudentRepository;
import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import com.trinh.english_center_be.modules.teacher.repository.TeacherRepository;
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
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Development convenience: creates one admin, one teacher and one student account so every layout can be tried.
 * Opt-in only ({@code SEED_DEMO_USERS=true}) and only under the {@code dev} profile; never runs in production.
 * Idempotent: an account whose username or email already exists is left untouched.
 */
@Slf4j
@Component
@Profile("dev")
@ConditionalOnProperty(name = "SEED_DEMO_USERS", havingValue = "true")
@Order(100)
@RequiredArgsConstructor
public class DemoUserSeeder implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${DEMO_USER_PASSWORD:Demo12345}")
    private String password;

    @Override
    public void run(ApplicationArguments args) {
        seed("admin", "admin@gmail.com", "Admin Demo", Roles.ADMIN);
        seed("teacher", "teacher@gmail.com", "Teacher Demo", Roles.TEACHER);
        seed("student", "student@gmail.com", "Student Demo", Roles.STUDENT);
    }

    private void seed(String username, String email, String fullName, Roles roleCode) {
        if (userRepository.existsByUsername(username) || userRepository.findByEmailIgnoreCase(email).isPresent()) {
            log.info("Demo account '{}' already exists, skipped", username);
            return;
        }
        Role role = roleRepository.findByCode(roleCode).orElseThrow();
        User user = userRepository.save(User.builder()
                .username(username)
                .email(email)
                .fullName(fullName)
                .password(passwordEncoder.encode(password))
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .build());
        userRoleRepository.save(UserRole.builder().userId(user.getId()).roleId(role.getId()).build());
        if (roleCode == Roles.TEACHER) teacherRepository.save(Teacher.builder().user(user).build());
        if (roleCode == Roles.STUDENT) studentRepository.save(Student.builder().user(user).build());
        log.info("Seeded demo account '{}' ({})", username, roleCode);
    }
}
