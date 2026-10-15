package com.trinh.english_center_be.modules.student.repository;

import com.trinh.english_center_be.modules.student.entity.Student;
import com.trinh.english_center_be.modules.user.entity.User;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface StudentRepository extends MongoRepository<Student, String> {

    Optional<Student> findByUser(User user);
}
