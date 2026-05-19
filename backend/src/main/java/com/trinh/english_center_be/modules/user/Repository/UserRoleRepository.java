package com.trinh.english_center_be.modules.user.Repository;

import com.trinh.english_center_be.modules.user.entity.UserRole;
import com.trinh.english_center_be.modules.user.entity.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {

    @Query("SELECT ur FROM UserRole ur JOIN FETCH ur.role WHERE ur.id.userId = :userId")
    List<UserRole> findByUserIdWithRole(@Param("userId") Long userId);

    boolean existsByIdUserIdAndIdRoleId(Long userId, Long roleId);
}
