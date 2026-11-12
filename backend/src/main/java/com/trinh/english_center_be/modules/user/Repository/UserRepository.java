package com.trinh.english_center_be.modules.user.Repository;

import com.trinh.english_center_be.modules.user.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
