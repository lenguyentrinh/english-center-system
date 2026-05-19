package com.trinh.english_center_be.shared.exception;

import com.trinh.english_center_be.shared.enums.ErrorCode;

public class TokenExpiredException extends BusinessException {
    public TokenExpiredException() {
        super(ErrorCode.TOKEN_EXPIRED.getMessage(), ErrorCode.TOKEN_EXPIRED.getStatus());
    }
}
