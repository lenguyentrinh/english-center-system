package com.trinh.english_center_be.modules.user.Repository;

import com.trinh.english_center_be.modules.user.entity.UserBusinessRole;
import com.trinh.english_center_be.modules.user.entity.UserBusinessRoleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserBusinessRoleRepository extends JpaRepository<UserBusinessRole, UserBusinessRoleId> {

    @Query("SELECT ubr FROM UserBusinessRole ubr JOIN FETCH ubr.businessRole br LEFT JOIN FETCH br.roles WHERE ubr.id.userId = :userId")
    List<UserBusinessRole> findByUserIdWithBusinessRoleAndRoles(@Param("userId") Long userId);

    boolean existsByIdUserIdAndIdBusinessRoleId(Long userId, Long businessRoleId);
}
