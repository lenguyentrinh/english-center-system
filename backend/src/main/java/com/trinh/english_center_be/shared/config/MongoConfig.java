package com.trinh.english_center_be.shared.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * MongoDB configuration: enables {@code @CreatedDate}/{@code @LastModifiedDate} auditing and
 * stores java.time local types as ISO-8601 strings.
 *
 * <p>Spring Data's default mapping converts LocalDate/LocalDateTime to java.util.Date using the
 * JVM default zone, so the same stored value can shift by a day when the server zone differs
 * between environments (e.g. Windows Asia/Ho_Chi_Minh vs a UTC container). ISO strings are
 * zone-independent and still sort lexicographically in chronological order.
 */
@Configuration
@EnableMongoAuditing
public class MongoConfig {

    @Bean
    public MongoCustomConversions mongoCustomConversions() {
        return new MongoCustomConversions(List.of(
                new LocalDateToStringConverter(),
                new StringToLocalDateConverter(),
                new LocalTimeToStringConverter(),
                new StringToLocalTimeConverter(),
                new LocalDateTimeToStringConverter(),
                new StringToLocalDateTimeConverter()
        ));
    }

    @WritingConverter
    static class LocalDateToStringConverter implements Converter<LocalDate, String> {
        @Override
        public String convert(LocalDate source) {
            return source.toString();
        }
    }

    @ReadingConverter
    static class StringToLocalDateConverter implements Converter<String, LocalDate> {
        @Override
        public LocalDate convert(String source) {
            return LocalDate.parse(source);
        }
    }

    @WritingConverter
    static class LocalTimeToStringConverter implements Converter<LocalTime, String> {
        @Override
        public String convert(LocalTime source) {
            return source.toString();
        }
    }

    @ReadingConverter
    static class StringToLocalTimeConverter implements Converter<String, LocalTime> {
        @Override
        public LocalTime convert(String source) {
            return LocalTime.parse(source);
        }
    }

    @WritingConverter
    static class LocalDateTimeToStringConverter implements Converter<LocalDateTime, String> {
        @Override
        public String convert(LocalDateTime source) {
            return source.toString();
        }
    }

    @ReadingConverter
    static class StringToLocalDateTimeConverter implements Converter<String, LocalDateTime> {
        @Override
        public LocalDateTime convert(String source) {
            return LocalDateTime.parse(source);
        }
    }
}
