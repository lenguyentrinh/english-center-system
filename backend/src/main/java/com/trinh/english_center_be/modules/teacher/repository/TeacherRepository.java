package com.trinh.english_center_be.modules.teacher.repository;

import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import com.trinh.english_center_be.modules.user.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TeacherRepository extends MongoRepository<Teacher, String> {

    Optional<Teacher> findByUser(User user);

    List<Teacher> findByUserIn(List<User> users);

    List<Teacher> findByCategoryIdsContaining(String categoryId);
}
