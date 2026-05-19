package com.trinh.english_center_be.shared.util;

public class StringUtil {
    //success
    public static final String LIST_SUCCESSFULLY = "List all %s successfully";
    public static final String RETRIEVED_SUCCESSFULLY = "%s retrieved successfully by id: %d";
    public static final String UPDATED_SUCCESSFULLY = "%s updated successfully by id: %d";
    public static final String CREATED_SUCCESSFULLY = "%s created successfully";
    public static final String DELETED_SUCCESSFULLY = "%s soft deleted successfully";
    public static final String ASSIGN_SUCCESSFULLY = "%s assigned to user successfully";
    public static final String REMOVE_SUCCESSFULLY = "%s removed from user successfully";

    // not expect
    public static final  String ENTITY_NOT_FOUND_BY = "%s not found by %s: %s";
    public static final String ENTITY_ALREADY_EXISTS = "%s already exists by %s";
    public static final String NOT_FOUND_BY_ID="%s not found by id: %d";
    public static final String USER_ALREADY_VALUE= "User already has this %s";
    public static final String USER_DOES_NOT_VALUE= "User does not have this %s";

    //inactive
    public static final String OBJECT_INACTIVE = "%s is inactive";

    public static final String USER_ACCOUNT_NOT_ACTIVE = "User account is not active";
    public static final String STUDENT_ROLE_NOT_FOUND  = "Student role not found";



    public static final String NOT_FOUND_DELETED_BY_ID = "%s with  %d was deleted";

    //name
    public static final String ROLE="Role";
    public static final String USER="User";
    public static final String BUSINESS_ROLE="Business role";
    public static final String CLASS="Class";

    //field
    public static final String CODE_FIELD = "role";
    public static final String USERNAME_FIELD = "username";
    public static final String EMAIL_FIELD = "email";

    //auth
    public static final String  LOGIN_SUCCESS= "Login successful";
    public static final String  SIGNUP_SUCCESS= "Signup successful";
    public static final String  LOGOUT_SUCCESS= "Logout successful";
}
