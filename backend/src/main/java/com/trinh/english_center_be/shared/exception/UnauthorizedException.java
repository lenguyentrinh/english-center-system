package com.trinh.english_center_be.shared.exception;

import com.trinh.english_center_be.shared.enums.ErrorCode;

public class UnauthorizedException extends BusinessException {
    public UnauthorizedException() {
        super(
                ErrorCode.UNAUTHORIZED.getMessage(),
                ErrorCode.UNAUTHORIZED.getStatus());
    }

    public UnauthorizedException(String message) {
        super(message, ErrorCode.UNAUTHORIZED.getStatus());
    }
}
