package com.trinh.english_center_be.shared;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Common audit fields shared by all JPA entities.
 * Auditing is enabled by {@link com.trinh.english_center_be.shared.config.JpaConfig}.
 * Subclasses declare their own {@code String id} annotated with {@code @Id}.
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@SuperBuilder
@Setter
@Getter
@NoArgsConstructor
public class BaseEntity {

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updateAt;

    @Builder.Default
    private Boolean active = true;
}
