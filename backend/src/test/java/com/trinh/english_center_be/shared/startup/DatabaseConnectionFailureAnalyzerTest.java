package com.trinh.english_center_be.shared.startup;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.ConnectException;
import java.sql.SQLException;
import org.junit.jupiter.api.Test;
import org.springframework.boot.diagnostics.FailureAnalysis;

class DatabaseConnectionFailureAnalyzerTest {

    private final DatabaseConnectionFailureAnalyzer analyzer = new DatabaseConnectionFailureAnalyzer();

    private FailureAnalysis analyze(SQLException e) {
        DatabaseConnectionException ex = new DatabaseConnectionException("jdbc:mysql://localhost:3306/db", "root", e);
        return analyzer.analyze(ex, ex);
    }

    @Test
    void wrongCredentialsAreReportedAsSuch() {
        FailureAnalysis a = analyze(new SQLException("Access denied for user root", "28000", 1045));

        assertThat(a.getDescription()).contains("sai username hoặc password").contains("Username: root");
        assertThat(a.getAction()).contains("MYSQL_USER").contains("MYSQL_PASSWORD");
    }

    @Test
    void unreachableServerIsReportedAsSuch() {
        SQLException e = new SQLException("Communications link failure", "08S01", 0, new ConnectException("refused"));

        assertThat(analyze(e).getDescription()).contains("Không kết nối được tới MySQL server");
    }

    @Test
    void unknownDatabaseIsReportedAsSuch() {
        assertThat(analyze(new SQLException("Unknown database x", "42000", 1049)).getDescription())
                .contains("Database không tồn tại");
    }
}
