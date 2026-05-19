package com.trinh.english_center_be.shared.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.Map;
import lombok.Builder;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private String message;

    private HttpStatus status;

    private LocalDateTime timestamp;

    private String path;

    private String origin;

    private Map<String, String> errors;
}