package com.trinh.english_center_be.modules.user;

import static org.assertj.core.api.Assertions.assertThat;

import com.trinh.english_center_be.modules.student.repository.StudentRepository;
import com.trinh.english_center_be.modules.teacher.repository.TeacherRepository;
import com.trinh.english_center_be.modules.user.dto.UserRequest;
import com.trinh.english_center_be.modules.user.dto.UserResponse;
import com.trinh.english_center_be.modules.user.service.UserService;
import com.trinh.english_center_be.shared.enums.Roles;
import com.trinh.english_center_be.shared.enums.UserStatus;
import com.trinh.english_center_be.modules.auth.dto.LoginRequest;
import com.trinh.english_center_be.modules.auth.service.AuthService;
import com.trinh.english_center_be.modules.user.Repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/** Runs the admin "create user with a STUDENT / TEACHER role" flow against a real (in-memory) database. */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:usertest;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class UserCreationIntegrationTest {

    @Autowired UserService userService;
    @Autowired StudentRepository studentRepository;
    @Autowired TeacherRepository teacherRepository;
    @Autowired UserRepository userRepository;
    @Autowired AuthService authService;

    private UserResponse create(String name, Roles role) {
        return userService.create(new UserRequest(name, "Passw0rd1", name + "@example.com", "Test " + name, null,
                UserStatus.ACTIVE, role));
    }

    @Test
    void adminCreatesStudent() {
        UserResponse user = create("student1", Roles.STUDENT);

        assertThat(user.roles()).containsExactly("STUDENT");
        assertThat(studentRepository.findAll()).extracting(st -> st.getUser().getId()).contains(user.id());
    }

    @Test
    void adminCreatesTeacher() {
        UserResponse user = create("teacher1", Roles.TEACHER);

        assertThat(user.roles()).containsExactly("TEACHER");
        assertThat(teacherRepository.findAll()).extracting(t -> t.getUser().getId()).contains(user.id());
    }

    @Test
    void changingRoleMovesTheProfile() {
        UserResponse user = create("mover1", Roles.STUDENT);

        userService.changeRole(user.id(), Roles.TEACHER, "someone-else");

        assertThat(teacherRepository.findAll()).extracting(t -> t.getUser().getId()).contains(user.id());
        assertThat(studentRepository.findAll()).filteredOn(st -> st.getUser().getId().equals(user.id()))
                .allMatch(st -> Boolean.FALSE.equals(st.getActive()));
    }

    @Test
    void userWithSpecialCharPasswordHashCanLogInByEmailAndUsername() {
        UserResponse user = create("special1", Roles.STUDENT);
        var entity = userRepository.findById(user.id()).orElseThrow();
        // Same hash that was handed to the admin for the password "@@##Lethinguyentrinh154@#"
        entity.setPassword("$2a$10$q4YoOM0gXbRpMp7RqZrXBe4zSTMo08j6Qbaa1G8XOqm/mTksP.Rey");
        userRepository.save(entity);

        assertThat(authService.login(new LoginRequest("special1@example.com", "@@##Lethinguyentrinh154@#"))).isNotNull();
        assertThat(authService.login(new LoginRequest("special1", "@@##Lethinguyentrinh154@#"))).isNotNull();
    }
}
