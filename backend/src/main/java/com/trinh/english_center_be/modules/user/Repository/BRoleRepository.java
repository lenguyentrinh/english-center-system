package com.trinh.english_center_be.modules.user.Repository;

import com.trinh.english_center_be.modules.user.entity.BusinessRole;
import com.trinh.english_center_be.shared.enums.BusinessRoles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BRoleRepository extends JpaRepository<BusinessRole, Long> {

    boolean existsByCode(BusinessRoles code);

    boolean existsByCodeAndIdNot(BusinessRoles code, Long id);

    List<BusinessRole> findByActiveTrue();

    @Query("SELECT br FROM BusinessRole br LEFT JOIN FETCH br.roles WHERE br.id = :id")
    Optional<BusinessRole> findByIdWithRoles(@Param("id") Long id);
}
