package com.trinh.english_center_be.shared.exception;

import com.trinh.english_center_be.shared.enums.ErrorCode;

public class ResourceNotFoundException extends BusinessException{
    public ResourceNotFoundException() {
        super(ErrorCode.RESOURCE_NOT_FOUND.getMessage(), ErrorCode.RESOURCE_NOT_FOUND.getStatus());
    }

    public ResourceNotFoundException(String message) {
        super(message, ErrorCode.RESOURCE_NOT_FOUND.getStatus());
    }
}
