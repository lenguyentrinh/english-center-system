package com.trinh.english_center_be.shared.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trinh.english_center_be.modules.academic.entity.Course;
import com.trinh.english_center_be.modules.academic.repository.CourseRepository;
import com.trinh.english_center_be.shared.enums.CourseStatus;
import java.io.InputStream;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

/**
 * Creates one course per grade (1-12) from {@code seed/curriculum.json}, the repo's source of truth for the
 * curriculum. Opt-in ({@code SEED_CURRICULUM=true}), dev profile only, idempotent by course code. Teachers are
 * not assigned here; an admin does that afterwards.
 */
@Slf4j
@Component
@Profile("dev")
@ConditionalOnProperty(name = "SEED_CURRICULUM", havingValue = "true")
@Order(200)
@RequiredArgsConstructor
public class CurriculumSeeder implements ApplicationRunner {

    private static final String RESOURCE = "seed/curriculum.json";

    private final CourseRepository courseRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        JsonNode root;
        try (InputStream in = new ClassPathResource(RESOURCE).getInputStream()) {
            root = objectMapper.readTree(in);
        }
        String textbook = root.path("textbook").asText("Global Success");
        LocalDate start = LocalDate.now();
        int created = 0;
        for (JsonNode g : root.path("grades")) {
            int grade = g.path("grade").asInt();
            String code = String.format("GS-G%02d", grade);
            if (courseRepository.existsByCode(code)) continue;
            courseRepository.save(Course.builder()
                    .code(code)
                    .name("Tiếng Anh lớp " + grade + " (" + textbook + ")")
                    .startDate(start)
                    .endDate(start.plusMonths(9))
                    .maxStudent(30)
                    .status(CourseStatus.OPEN)
                    .minimumAge(grade + 5)
                    .requiredEntryLevel("Lớp " + grade)
                    .prerequisitesRequired(false)
                    .build());
            created++;
        }
        log.info("Curriculum seed: created {} course(s) from {}", created, RESOURCE);
    }
}
