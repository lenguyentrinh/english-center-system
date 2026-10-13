package com.trinh.english_center_be.modules.auth.repository;

import com.trinh.english_center_be.modules.auth.entity.PasswordResetOtp;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PasswordResetOtpRepository extends MongoRepository<PasswordResetOtp, String> {
    Optional<PasswordResetOtp> findByUserId(String userId);
}
