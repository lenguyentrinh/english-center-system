package com.trinh.english_center_be.shared.startup;

import java.sql.SQLException;

/** Thrown at startup when the configured database cannot be reached or rejects the credentials. */
public class DatabaseConnectionException extends RuntimeException {

    private final String url;
    private final String username;

    public DatabaseConnectionException(String url, String username, SQLException cause) {
        super("Cannot connect to database " + url + " as '" + username + "': " + cause.getMessage(), cause);
        this.url = url;
        this.username = username;
    }

    public String getUrl() {
        return url;
    }

    public String getUsername() {
        return username;
    }
}
