package com.trinh.english_center_be.shared.response;

import java.time.LocalDateTime;

public record ApiErrorResponse(
        int status,
        String message,
        LocalDateTime timestamp,
        String path
) {
}