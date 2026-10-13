package com.trinh.english_center_be.modules.user.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import com.trinh.english_center_be.modules.user.dto.BusinessRoleResponse;
import com.trinh.english_center_be.modules.user.entity.BusinessRole;
import com.trinh.english_center_be.modules.user.entity.Role;
import com.trinh.english_center_be.shared.enums.BusinessRoles;
import com.trinh.english_center_be.shared.enums.Roles;
import java.util.List;
import org.junit.jupiter.api.Test;

class BusinessRoleMapperTest {

    @Test
    void toResponseIncludesOnlyActiveRolesLoadedForTheBusinessRole() {
        BusinessRole businessRole = BusinessRole.builder()
                .id("b1")
                .code(BusinessRoles.IELTS_TEACHING_INTERMEDIATE)
                .active(true)
                .build();
        Role active = Role.builder().id("r1").code(Roles.TEACHER_IELTS_6).active(true).businessRole(businessRole).build();
        Role inactive = Role.builder().id("r2").code(Roles.TEACHER_IELTS_7).active(false).businessRole(businessRole).build();

        BusinessRoleResponse response = BusinessRoleMapper.toResponse(businessRole, List.of(active, inactive));

        assertThat(response.id()).isEqualTo("b1");
        assertThat(response.roles()).hasSize(1);
        assertThat(response.roles().get(0).id()).isEqualTo("r1");
        assertThat(response.roles().get(0).businessRoleId()).isEqualTo("b1");
    }

    @Test
    void toResponseWithoutRolesReturnsEmptyList() {
        BusinessRole businessRole = BusinessRole.builder().id("b1").active(true).build();

        BusinessRoleResponse response = BusinessRoleMapper.toResponse(businessRole, null);

        assertThat(response.roles()).isEmpty();
    }
}
