package com.trinh.english_center_be.shared.exception;

import com.trinh.english_center_be.shared.enums.ErrorCode;

public class InvalidCredentialException extends BusinessException {
    public InvalidCredentialException() {
        super(
                ErrorCode.INVALID_CREDENTIAL.getMessage(),
                ErrorCode.INVALID_CREDENTIAL.getStatus());
    }

    public InvalidCredentialException(String message) {
        super(message, ErrorCode.INVALID_CREDENTIAL.getStatus());
    }

    public InvalidCredentialException(String message, String origin) {
        super(
                message,
                ErrorCode.INVALID_CREDENTIAL.getStatus(),
                origin
        );
    }
}
