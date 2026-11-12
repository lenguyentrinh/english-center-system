package com.trinh.english_center_be.modules.user.Repository;

import com.trinh.english_center_be.modules.user.entity.UserBusinessRole;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserBusinessRoleRepository extends JpaRepository<UserBusinessRole, String> {

    List<UserBusinessRole> findByUserId(String userId);

    Optional<UserBusinessRole> findByUserIdAndBusinessRoleId(String userId, String businessRoleId);

    boolean existsByUserIdAndBusinessRoleId(String userId, String businessRoleId);
}
