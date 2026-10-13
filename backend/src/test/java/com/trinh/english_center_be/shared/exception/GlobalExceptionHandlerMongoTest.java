package com.trinh.english_center_be.shared.exception;

import static org.assertj.core.api.Assertions.assertThat;

import com.trinh.english_center_be.shared.enums.ErrorCode;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

class GlobalExceptionHandlerMongoTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void duplicateKeyMapsToEntityExistsError() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/users");

        ResponseEntity<ErrorResponse> response = handler.handleDuplicateKey(new DuplicateKeyException("E11000"), request);

        assertThat(response.getStatusCode()).isEqualTo(ErrorCode.ENTITY_EXISTS.getStatus());
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getMessage()).isEqualTo(ErrorCode.ENTITY_EXISTS.getMessage());
        assertThat(response.getBody().getPath()).isEqualTo("/users");
        assertThat(response.getBody().getOrigin()).isEqualTo("database");
    }

    @Test
    void dataAccessFailureMapsToDatabaseError() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/courses");

        ResponseEntity<ErrorResponse> response =
                handler.handleDataAccess(new DataAccessResourceFailureException("connection refused"), request);

        assertThat(response.getStatusCode()).isEqualTo(ErrorCode.DATABASE_ERROR.getStatus());
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getMessage()).isEqualTo(ErrorCode.DATABASE_ERROR.getMessage());
    }
}
