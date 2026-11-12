package com.trinh.english_center_be.modules.user.Repository;

import com.trinh.english_center_be.modules.user.entity.BusinessRole;
import com.trinh.english_center_be.shared.enums.BusinessRoles;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BRoleRepository extends JpaRepository<BusinessRole, String> {

    boolean existsByCode(BusinessRoles code);

    boolean existsByCodeAndIdNot(BusinessRoles code, String id);

    List<BusinessRole> findByActiveTrue();
}
