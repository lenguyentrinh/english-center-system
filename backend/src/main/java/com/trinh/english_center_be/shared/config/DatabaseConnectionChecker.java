package com.trinh.english_center_be.shared.config;

import java.sql.Connection;
import java.sql.SQLException;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.stereotype.Component;

/**
 * Fails fast with a readable message when the database cannot be reached.
 *
 * Without this, Hibernate swallows the connection error and the app dies later with
 * "Unable to determine Dialect without JDBC metadata", which hides the real cause
 * (wrong password, DB down, unknown database...).
 */
@Component
public class DatabaseConnectionChecker implements BeanPostProcessor {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConnectionChecker.class);

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) {
        if (bean instanceof DataSource dataSource) {
            try (Connection ignored = dataSource.getConnection()) {
                log.info("Database connection OK ({})", beanName);
            } catch (SQLException e) {
                String message = describe(e);
                log.error("DATABASE CONNECTION FAILED: {}", message);
                throw new IllegalStateException("Cannot connect to the database: " + message, e);
            }
        }
        return bean;
    }

    private static String describe(SQLException e) {
        String raw = e.getMessage() == null ? "" : e.getMessage();
        String lower = raw.toLowerCase();
        String hint;
        if (lower.contains("access denied")) {
            hint = "Wrong MYSQL_USER or MYSQL_PASSWORD (check backend/.env and application.yml).";
        } else if (lower.contains("unknown database")) {
            hint = "The database does not exist. Create it or add createDatabaseIfNotExist=true to MYSQL_URL.";
        } else if (lower.contains("communications link failure") || lower.contains("connection refused")) {
            hint = "MySQL is not reachable. Check that it is running and that host/port in MYSQL_URL are correct.";
        } else {
            hint = "Check MYSQL_URL, MYSQL_USER and MYSQL_PASSWORD.";
        }
        return hint + " [SQLState=" + e.getSQLState() + ", errorCode=" + e.getErrorCode() + "] " + raw;
    }
}
