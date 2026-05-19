package com.trinh.english_center_be.shared.response;

public record ApiResponse<T>(
        int status,
        String message,
        T data
) {
}