package com.trinh.english_center_be.modules.category.repository;

import com.trinh.english_center_be.modules.category.entity.Category;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CategoryRepository extends MongoRepository<Category, String> {

    Optional<Category> findByNameKey(String nameKey);

    List<Category> findByActiveTrueOrderByNameAsc();
}
