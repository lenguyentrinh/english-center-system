package com.trinh.english_center_be.shared.exception;

import com.trinh.english_center_be.shared.enums.ErrorCode;

public class ForbiddenException extends BusinessException {
    public ForbiddenException() {
        super(
                ErrorCode.FORBIDDEN.getMessage(),
                ErrorCode.FORBIDDEN.getStatus());
    }

    public ForbiddenException(String message) {
        super(message, ErrorCode.FORBIDDEN.getStatus());
    }
}
