package com.trinh.english_center_be.modules.user.Repository;

import com.trinh.english_center_be.modules.user.entity.BusinessRole;
import com.trinh.english_center_be.shared.enums.BusinessRoles;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BRoleRepository extends JpaRepository<BusinessRole, Long> {

    boolean existsByCode(BusinessRoles code);

    boolean existsByCodeAndIdNot(BusinessRoles code, Long id);

    List<BusinessRole> findByActiveTrue();
}
