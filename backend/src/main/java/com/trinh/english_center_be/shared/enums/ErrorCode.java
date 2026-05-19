package com.trinh.english_center_be.shared.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    FORBIDDEN(
            HttpStatus.FORBIDDEN,
            "Access denied"
    ),

    INVALID_CREDENTIAL(
            HttpStatus.UNAUTHORIZED,
            "Email or password incorrect"
    ),

    RESOURCE_NOT_FOUND(
            HttpStatus.NOT_FOUND,
            "Resource not found"
    ),

    TOKEN_EXPIRED(
            HttpStatus.UNAUTHORIZED,
            "Token has expired"
    ),

    UNAUTHORIZED(
            HttpStatus.UNAUTHORIZED,
            "Authentication required"
    ),

    INTERNAL_SERVER_ERROR(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "Something went wrong"
    ),

    VALIDATION_ERROR(
            HttpStatus.BAD_REQUEST,
            "Validation failed"
    ),

    DATABASE_ERROR(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "Database operation failed"),

    USERNAME_EXISTS(
            HttpStatus.BAD_REQUEST,
            "Username already exists"
    );

    private final HttpStatus status;
    private final String message;
}
