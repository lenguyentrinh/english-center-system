package com.trinh.english_center_be.modules.user.Repository;

import com.trinh.english_center_be.modules.user.entity.UserRole;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRoleRepository extends MongoRepository<UserRole, String> {

    List<UserRole> findByUserId(String userId);

    List<UserRole> findByUserIdIn(java.util.Collection<String> userIds);

    List<UserRole> findByRoleId(String roleId);

    Optional<UserRole> findByUserIdAndRoleId(String userId, String roleId);

    boolean existsByUserIdAndRoleId(String userId, String roleId);
}
