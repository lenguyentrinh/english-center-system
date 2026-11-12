package com.trinh.english_center_be.shared.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Enables {@code @CreatedDate}/{@code @LastModifiedDate} auditing and the expired-code cleanup job. */
@Configuration
@EnableJpaAuditing
@EnableScheduling
public class JpaConfig {
}
