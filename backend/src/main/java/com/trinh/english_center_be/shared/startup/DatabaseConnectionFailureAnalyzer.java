package com.trinh.english_center_be.shared.startup;

import java.sql.SQLException;
import org.springframework.boot.diagnostics.AbstractFailureAnalyzer;
import org.springframework.boot.diagnostics.FailureAnalysis;

/** Turns a {@link DatabaseConnectionException} into a readable "APPLICATION FAILED TO START" report. */
public class DatabaseConnectionFailureAnalyzer extends AbstractFailureAnalyzer<DatabaseConnectionException> {

    @Override
    protected FailureAnalysis analyze(Throwable rootFailure, DatabaseConnectionException cause) {
        SQLException sql = (SQLException) cause.getCause();
        String target = "URL: " + cause.getUrl() + "\nUsername: " + cause.getUsername();

        String description;
        String action;
        if (isAccessDenied(sql)) {
            description = "MySQL từ chối đăng nhập: sai username hoặc password (hoặc user không có quyền truy cập database).\n"
                    + target + "\nChi tiết: " + sql.getMessage();
            action = "Kiểm tra MYSQL_USER và MYSQL_PASSWORD trong backend/.env (hoặc biến môi trường). "
                    + "Nếu chạy bằng docker compose, mật khẩu root là MYSQL_ROOT_PASSWORD trong .env. "
                    + "Lưu ý: mật khẩu của container MySQL đã tạo trước đó không đổi khi sửa .env, "
                    + "hãy xóa volume (docker compose down -v) nếu muốn tạo lại.";
        } else if (isUnknownDatabase(sql)) {
            description = "Database không tồn tại trên MySQL server.\n" + target + "\nChi tiết: " + sql.getMessage();
            action = "Tạo database (CREATE DATABASE english_center_db CHARACTER SET utf8mb4) "
                    + "hoặc thêm createDatabaseIfNotExist=true vào MYSQL_URL.";
        } else if (isUnreachable(sql)) {
            description = "Không kết nối được tới MySQL server (chưa chạy, sai host/port hoặc bị chặn).\n"
                    + target + "\nChi tiết: " + sql.getMessage();
            action = "Khởi động MySQL (docker compose up -d mysql) và kiểm tra host/port trong MYSQL_URL.";
        } else {
            description = "Không kết nối được tới database.\n" + target + "\nChi tiết: " + sql.getMessage();
            action = "Kiểm tra MYSQL_URL, MYSQL_USER, MYSQL_PASSWORD và trạng thái MySQL server.";
        }
        return new FailureAnalysis(description, action, cause);
    }

    static boolean isAccessDenied(SQLException e) {
        return e.getErrorCode() == 1045 || "28000".equals(e.getSQLState());
    }

    static boolean isUnknownDatabase(SQLException e) {
        return e.getErrorCode() == 1049
                || (e.getMessage() != null && e.getMessage().contains("Unknown database"));
    }

    static boolean isUnreachable(SQLException e) {
        return (e.getSQLState() != null && e.getSQLState().startsWith("08"))
                || (e.getCause() instanceof java.net.ConnectException)
                || (e.getCause() instanceof java.net.UnknownHostException);
    }
}
