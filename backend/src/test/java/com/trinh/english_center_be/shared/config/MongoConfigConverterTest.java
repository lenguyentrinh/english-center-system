package com.trinh.english_center_be.shared.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;

/**
 * The java.time converters must be zone-independent: the stored ISO string must read back to the
 * same value no matter which JVM default time zone is active.
 */
class MongoConfigConverterTest {

    private final MongoConfig.LocalDateToStringConverter localDateToString = new MongoConfig.LocalDateToStringConverter();
    private final MongoConfig.StringToLocalDateConverter stringToLocalDate = new MongoConfig.StringToLocalDateConverter();
    private final MongoConfig.LocalTimeToStringConverter localTimeToString = new MongoConfig.LocalTimeToStringConverter();
    private final MongoConfig.StringToLocalTimeConverter stringToLocalTime = new MongoConfig.StringToLocalTimeConverter();
    private final MongoConfig.LocalDateTimeToStringConverter localDateTimeToString = new MongoConfig.LocalDateTimeToStringConverter();
    private final MongoConfig.StringToLocalDateTimeConverter stringToLocalDateTime = new MongoConfig.StringToLocalDateTimeConverter();

    @Test
    void localDateRoundTripsAsIsoString() {
        LocalDate date = LocalDate.of(2026, 10, 31);

        String stored = localDateToString.convert(date);

        assertThat(stored).isEqualTo("2026-10-31");
        assertThat(stringToLocalDate.convert(stored)).isEqualTo(date);
    }

    @Test
    void localTimeRoundTripsWithAndWithoutSeconds() {
        LocalTime withoutSeconds = LocalTime.of(9, 30);
        LocalTime withSeconds = LocalTime.of(18, 5, 45);

        assertThat(stringToLocalTime.convert(localTimeToString.convert(withoutSeconds))).isEqualTo(withoutSeconds);
        assertThat(stringToLocalTime.convert(localTimeToString.convert(withSeconds))).isEqualTo(withSeconds);
    }

    @Test
    void localDateTimeRoundTripsIncludingNanos() {
        LocalDateTime value = LocalDateTime.of(2026, 10, 13, 7, 15, 0, 123_000_000);

        String stored = localDateTimeToString.convert(value);

        assertThat(stringToLocalDateTime.convert(stored)).isEqualTo(value);
    }

    @Test
    void storedValueDoesNotDependOnJvmTimeZone() {
        java.util.TimeZone original = java.util.TimeZone.getDefault();
        try {
            java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
            String inVietnam = localDateToString.convert(LocalDate.of(2026, 1, 1));

            java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("UTC"));
            String inUtc = localDateToString.convert(LocalDate.of(2026, 1, 1));

            assertThat(inVietnam).isEqualTo("2026-01-01").isEqualTo(inUtc);
            assertThat(stringToLocalDate.convert(inVietnam)).isEqualTo(LocalDate.of(2026, 1, 1));
        } finally {
            java.util.TimeZone.setDefault(original);
        }
    }
}
