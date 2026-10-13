package com.trinh.english_center_be.modules.auth.repository;

import com.trinh.english_center_be.modules.auth.entity.RefreshToken;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RefreshTokenRepository extends MongoRepository<RefreshToken, String> {
}
