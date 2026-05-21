package com.trinh.english_center_be.shared.util;

public class Constant {
    //name
    public static final String ROLE="Role";
    public static final String USER="User";
    public static final String BUSINESS_ROLE="Business role";
    public static final String CLASS="Class";

    //field
    public static final String CODE_FIELD = "Role";
    public static final String USERNAME_FIELD = "Username";
    public static final String EMAIL_FIELD = "Email";

    //regex
    public static final String PASSWORD_PATTERN = "^(?=.*[A-Za-z])(?=.*\\d).+$";
    public static final String PHONE_PATTERN = "^[0-9+\\-\\s()]*$";
}
