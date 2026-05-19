package com.trinh.english_center_be.shared.exception;

import com.trinh.english_center_be.shared.enums.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // =========================
    // Business Exception
    // =========================
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(
            BusinessException ex,
            HttpServletRequest request
    ) {
        ErrorResponse response = ErrorResponse.builder()
                .status(ex.getStatus())
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .origin(ex.getOrigin() != null ? ex.getOrigin() : "business")
                .build();

        return ResponseEntity.status(ex.getStatus()).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {
        ErrorCode error = ErrorCode.VALIDATION_ERROR;
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fe -> fieldErrors.put(fe.getField(), fe.getDefaultMessage()));

        ErrorResponse response = ErrorResponse.builder()
                .status(error.getStatus())
                .message(error.getMessage())
                .errors(fieldErrors)
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .origin("validation")
                .build();

        return ResponseEntity.status(error.getStatus()).body(response);
    }

    @ExceptionHandler({AuthorizationDeniedException.class, AccessDeniedException.class})
    public ResponseEntity<ErrorResponse> handleAuthorizationDenied(
            Exception ex,
            HttpServletRequest request
    ) {
        ErrorCode error = ErrorCode.FORBIDDEN;

        ErrorResponse response = ErrorResponse.builder()
                .status(error.getStatus())
                .message("Permission denied: your role is not allowed for this action")
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .origin("authorization")
                .build();

        return ResponseEntity.status(error.getStatus()).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnknown(
            Exception ex,
            HttpServletRequest request
    ) {
        ErrorCode error = ErrorCode.INTERNAL_SERVER_ERROR;

        ErrorResponse response = ErrorResponse.builder()
                .status(error.getStatus())
                .message(error.getMessage())
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .origin(ex.getClass().getSimpleName())
                .build();

        return ResponseEntity.status(error.getStatus()).body(response);
    }
}