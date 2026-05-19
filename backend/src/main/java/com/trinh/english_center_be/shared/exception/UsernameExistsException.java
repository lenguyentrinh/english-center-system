package com.trinh.english_center_be.shared.exception;

import com.trinh.english_center_be.shared.enums.ErrorCode;

public class UsernameExistsException extends BusinessException {
    public UsernameExistsException() {
        super(
                ErrorCode.USERNAME_EXISTS.getMessage(),
                ErrorCode.USERNAME_EXISTS.getStatus()
        );
    }
}
