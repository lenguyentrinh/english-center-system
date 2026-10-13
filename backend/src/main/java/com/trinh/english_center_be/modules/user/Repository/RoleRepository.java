package com.trinh.english_center_be.modules.user.Repository;

import com.trinh.english_center_be.modules.user.entity.BusinessRole;
import com.trinh.english_center_be.modules.user.entity.Role;
import com.trinh.english_center_be.shared.enums.Roles;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RoleRepository extends MongoRepository<Role, String> {

    Optional<Role> findByCode(Roles code);

    boolean existsByCode(Roles code);

    boolean existsByCodeAndIdNot(Roles code, String id);

    List<Role> findByActiveTrue();

    /** Replaces the former BusinessRole.roles inverse collection. */
    List<Role> findByBusinessRole(BusinessRole businessRole);
}
