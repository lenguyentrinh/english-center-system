package com.trinh.english_center_be.shared.util;

public class MessageConstant {
    //success
    public static final String LIST_SUCCESSFULLY = "List all %s successfully";
    public static final String RETRIEVED_SUCCESSFULLY = "%s retrieved successfully by id: %d";
    public static final String UPDATED_SUCCESSFULLY = "%s updated successfully by id: %d";
    public static final String CREATED_SUCCESSFULLY = "%s created successfully";
    public static final String DELETED_SUCCESSFULLY = "%s soft deleted successfully";
    public static final String ASSIGN_SUCCESSFULLY = "%s assigned to user successfully";
    public static final String REMOVE_SUCCESSFULLY = "%s removed from user successfully";

    // business message
    public static final String ENTITY_NOT_FOUND_BY = "%s not found by %s: %s";
    public static final String ENTITY_ALREADY_EXISTS = "%s already exists by %s";
    public static final String NOT_FOUND_BY_ID="%s not found by id: %d";
    public static final String USER_ALREADY_VALUE= "User already has this %s";
    public static final String USER_DOES_NOT_VALUE= "Cannot remove because User does not have this %s";
    public static final String FIELD_ALREADY_VALUE = "%s '%s' already exists";

    //inactive
    public static final String OBJECT_INACTIVE = "%s is inactive";
    public static final String ENTITY_INACTIVE_CAN_NOT_ASSIGN = "Cannot assign because %s is inactive.";

    public static final String USER_ACCOUNT_NOT_ACTIVE = "User account is not active";
    public static final String STUDENT_ROLE_NOT_FOUND  = "Student role not found";
    public static final String NOT_FOUND_DELETED_BY_ID = "%s with  %d was deleted";

    //auth
    public static final String  LOGIN_SUCCESS= "Login successful";
    public static final String  SIGNUP_SUCCESS= "Signup successful";
    public static final String  LOGOUT_SUCCESS= "Logout successful";

    //message validate field
    //user
    public static final String USERNAME_NOT_BLANK= "Username must not be blank";
    public static final String USERNAME_SIZE_INVALID = "Username must be between 5 and 50 characters";
    public static final String PASSWORD_NOT_BLANK= "Password must not be blank";
    public static final String PASSWORD_SIZE_INVALID = "Password must be between 6 and 255 characters";
    public static final String PASSWORD_LETTER_NUMBER_REQUIRED = "Password must contain at least one letter and one number";
    public static final String EMAIL_NOT_BLANK = "Email must not be blank";
    public static final String EMAIL_INVALID = "Email must be valid";
    public static final String FULL_NAME_SIZE_INVALID = "Full name must be between 5 and 100 characters";
    public static final String PHONE_INVALID = "Phone number must be valid";
    public static final String USER_STATUS_NOT_NULL = "Status must not be null";
    public static final String FULL_NAME_NOT_BLANK = "Full name must not be blank";

    //course
    public static final String CODE_NOT_BLANK = "Code must not be blank";
    public static final String CODE_MAX_LENGTH = "Code must be at most 50 characters";
    public static final String NAME_NOT_BLANK = "Name must not be blank";
    public static final String NAME_MAX_LENGTH = "Name must be at most 255 characters";
    public static final String START_DATE_NOT_NULL = "Start date must not be null";
    public static final String START_DATE_FUTURE_OR_PRESENT = "Start date must be in the present or future";
    public static final String END_DATE_NOT_NULL = "End date must not be null";
    public static final String MAX_STUDENT_NOT_NULL = "Max student must not be null";
    public static final String MAX_STUDENT_MIN = "Max student must be at least 1";
    public static final String STATUS_NOT_NULL = "Status must not be null";
}
