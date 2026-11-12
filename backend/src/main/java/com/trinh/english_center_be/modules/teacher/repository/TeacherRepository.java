package com.trinh.english_center_be.modules.teacher.repository;

import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import com.trinh.english_center_be.modules.user.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TeacherRepository extends JpaRepository<Teacher, String> {

    Optional<Teacher> findByUser(User user);

    List<Teacher> findByUserIn(List<User> users);

    @Query("select t from Teacher t where :categoryId member of t.categoryIds")
    List<Teacher> findByCategoryIdsContaining(@Param("categoryId") String categoryId);
}
