package com.trinh.english_center_be.shared.exception;

import com.trinh.english_center_be.shared.enums.ErrorCode;

public class ExistByFieldException extends BusinessException {
    public ExistByFieldException() {
        super(
                ErrorCode.ENTITY_EXISTS.getMessage(),
                ErrorCode.ENTITY_EXISTS.getStatus()
        );
    }

    public ExistByFieldException(String message) {
        super(
               message,
                ErrorCode.ENTITY_EXISTS.getStatus()
        );
    }
}
