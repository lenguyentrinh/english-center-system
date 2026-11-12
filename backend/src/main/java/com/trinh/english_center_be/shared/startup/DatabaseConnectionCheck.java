package com.trinh.english_center_be.shared.startup;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;

/**
 * Opens one JDBC connection with the configured settings before Spring/Hibernate start. Without this,
 * a wrong password or a stopped MySQL surfaces as Hibernate's misleading "Unable to determine Dialect
 * without JDBC metadata". Disable with {@code app.db-check.enabled=false}.
 */
public class DatabaseConnectionCheck implements EnvironmentPostProcessor, Ordered {

    private static final int LOGIN_TIMEOUT_SECONDS = 5;

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment env, SpringApplication application) {
        if (!env.getProperty("app.db-check.enabled", Boolean.class, true)) return;
        String url = env.getProperty("spring.datasource.url");
        if (url == null || url.isBlank()) return;
        String user = env.getProperty("spring.datasource.username", "");
        String password = env.getProperty("spring.datasource.password", "");

        DriverManager.setLoginTimeout(LOGIN_TIMEOUT_SECONDS);
        try (Connection ignored = DriverManager.getConnection(url, user, password)) {
            // reachable and credentials accepted
        } catch (SQLException e) {
            throw new DatabaseConnectionException(url, user, e);
        }
    }

    /** Runs after ConfigDataEnvironmentPostProcessor, so application.yml and .env are already loaded. */
    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }
}
