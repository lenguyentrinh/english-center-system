package com.trinh.english_center_be.modules.user.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.trinh.english_center_be.modules.academic.dto.CourseSuggestionResponse;
import com.trinh.english_center_be.modules.academic.entity.Course;
import com.trinh.english_center_be.modules.academic.repository.CourseRepository;
import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import com.trinh.english_center_be.modules.teacher.repository.TeacherRepository;
import com.trinh.english_center_be.modules.user.Repository.BRoleRepository;
import com.trinh.english_center_be.modules.user.Repository.RoleRepository;
import com.trinh.english_center_be.modules.user.Repository.UserBusinessRoleRepository;
import com.trinh.english_center_be.modules.user.Repository.UserRepository;
import com.trinh.english_center_be.modules.user.Repository.UserRoleRepository;
import com.trinh.english_center_be.modules.user.entity.BusinessRole;
import com.trinh.english_center_be.modules.user.entity.Role;
import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.modules.user.entity.UserBusinessRole;
import com.trinh.english_center_be.modules.user.entity.UserRole;
import com.trinh.english_center_be.modules.user.service.BRoleService;
import com.trinh.english_center_be.modules.user.service.UserService;
import com.trinh.english_center_be.shared.enums.Roles;
import com.trinh.english_center_be.shared.exception.BusinessException;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class UserRoleAssignmentServiceImplTest {

    @Mock private UserRoleRepository userRoleRepository;
    @Mock private UserBusinessRoleRepository userBusinessRoleRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private BRoleRepository bRoleRepository;
    @Mock private BRoleService bRoleService;
    @Mock private UserService userService;
    @Mock private UserRepository userRepository;
    @Mock private CourseRepository courseRepository;
    @Mock private TeacherRepository teacherRepository;

    @InjectMocks
    private UserRoleAssignmentServiceImpl service;

    @Test
    void assignRoleRejectsDuplicateLinkWithoutSaving() {
        when(userRoleRepository.existsByUserIdAndRoleId("u1", "r1")).thenReturn(true);

        assertThatThrownBy(() -> service.assignRole("u1", "r1"))
                .isInstanceOf(BusinessException.class)
                .extracting("status")
                .isEqualTo(HttpStatus.CONFLICT);
        verify(userRoleRepository, never()).save(any());
    }

    @Test
    void assignBusinessRoleLinksOnlyActiveRolesAndSuggestsCourses() {
        User user = User.builder().id("u1").active(true).build();
        BusinessRole businessRole = BusinessRole.builder().id("b1").active(true).build();
        Role active = Role.builder().id("r1").code(Roles.TEACHER_IELTS_6).active(true).build();
        Role inactive = Role.builder().id("r2").code(Roles.ADMIN).active(false).build();
        Course suggested = Course.builder().id("c1").code("IELTS-101").availableRoleTeacher(Roles.TEACHER_IELTS_6).build();

        when(userBusinessRoleRepository.existsByUserIdAndBusinessRoleId("u1", "b1")).thenReturn(false);
        when(userService.findById("u1")).thenReturn(user);
        when(bRoleService.findById("b1")).thenReturn(businessRole);
        when(roleRepository.findByBusinessRole(businessRole)).thenReturn(List.of(active, inactive));
        when(userRoleRepository.existsByUserIdAndRoleId("u1", "r1")).thenReturn(false);
        when(teacherRepository.findByUser(user)).thenReturn(Optional.empty());
        when(courseRepository.findByAvailableRoleTeacherInAndTeacherIsNull(List.of(Roles.TEACHER_IELTS_6, Roles.ADMIN)))
                .thenReturn(List.of(suggested));

        List<CourseSuggestionResponse> suggestions = service.assignBusinessRole("u1", "b1");

        assertThat(suggestions).hasSize(1);
        assertThat(suggestions.get(0).id()).isEqualTo("c1");

        ArgumentCaptor<UserRole> saved = ArgumentCaptor.forClass(UserRole.class);
        verify(userRoleRepository).save(saved.capture());
        assertThat(saved.getValue().getUserId()).isEqualTo("u1");
        assertThat(saved.getValue().getRoleId()).isEqualTo("r1");
        verify(teacherRepository).save(any(Teacher.class));
    }

    @Test
    void removeBusinessRoleDeletesOnlyRolesNotKeptByOtherBusinessRoles() {
        User user = User.builder().id("u1").active(true).build();
        Teacher teacher = Teacher.builder().id("t1").user(user).build();
        BusinessRole removedBr = BusinessRole.builder().id("b1").active(true).build();
        BusinessRole keptBr = BusinessRole.builder().id("b2").active(true).build();
        Role sharedRole = Role.builder().id("r1").code(Roles.TEACHER_IELTS_6).active(true).build();
        Role exclusiveRole = Role.builder().id("r2").code(Roles.ADMIN).active(true).build();

        UserBusinessRole link = UserBusinessRole.builder().id("ubr1").userId("u1").businessRoleId("b1").build();
        UserBusinessRole otherLink = UserBusinessRole.builder().id("ubr2").userId("u1").businessRoleId("b2").build();
        UserRole exclusiveLink = UserRole.builder().id("ur2").userId("u1").roleId("r2").build();

        when(userBusinessRoleRepository.findByUserIdAndBusinessRoleId("u1", "b1")).thenReturn(Optional.of(link));
        when(bRoleService.findById("b1")).thenReturn(removedBr);
        when(roleRepository.findByBusinessRole(removedBr)).thenReturn(List.of(sharedRole, exclusiveRole));
        // the link is deleted before the remaining links are re-read
        when(userBusinessRoleRepository.findByUserId("u1")).thenReturn(List.of(otherLink));
        when(bRoleRepository.findAllById(List.of("b2"))).thenReturn(List.of(keptBr));
        when(roleRepository.findByBusinessRole(keptBr)).thenReturn(List.of(sharedRole));
        when(userRoleRepository.findByUserIdAndRoleId("u1", "r2")).thenReturn(Optional.of(exclusiveLink));
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(teacherRepository.findByUser(user)).thenReturn(Optional.of(teacher));
        when(courseRepository.findByTeacherAndAvailableRoleTeacherIn(any(), anyList())).thenReturn(List.of());

        service.removeBusinessRole("u1", "b1");

        verify(userBusinessRoleRepository).delete(link);
        verify(userRoleRepository).delete(exclusiveLink);
        verify(userRoleRepository, never()).findByUserIdAndRoleId("u1", "r1");
    }
}
