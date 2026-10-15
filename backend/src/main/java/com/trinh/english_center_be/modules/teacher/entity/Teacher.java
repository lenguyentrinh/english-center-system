package com.trinh.english_center_be.modules.teacher.entity;

import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.shared.BaseEntity;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "teachers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Teacher extends BaseEntity {

    @Id
    private String id;

    @Indexed(unique = true)
    @DBRef(lazy = true)
    private User user;

    /** Stored as a string by Spring Data (default BigDecimal mapping); exposed as a JSON number. */
    private BigDecimal salary;

    /** Category ids this teacher can teach (admin-managed specialties). */
    @Builder.Default
    private List<String> categoryIds = new ArrayList<>();
}
