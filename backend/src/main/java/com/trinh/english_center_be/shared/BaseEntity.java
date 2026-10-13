package com.trinh.english_center_be.shared;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

/**
 * Common audit fields shared by all MongoDB documents.
 * Auditing is enabled by {@link com.trinh.english_center_be.shared.config.MongoConfig}.
 * Subclasses declare their own {@code String id} annotated with {@code @Id}.
 */
@SuperBuilder
@Setter
@Getter
@NoArgsConstructor
public class BaseEntity {

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updateAt;

    @Builder.Default
    private Boolean active = true;
}
