package com.trinh.english_center_be.modules.user.Repository;

import com.trinh.english_center_be.modules.user.entity.Role;
import com.trinh.english_center_be.shared.enums.Roles;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByCode(Roles code);

    boolean existsByCode(Roles code);

    boolean existsByCodeAndIdNot(Roles code, Long id);

    List<Role> findByActiveTrue();
}
