package com.trinh.english_center_be.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank
        @Size(min = 5, max = 50)
        String username,
        
        @NotBlank 
        @Size(min = 6, max = 50)
        @Pattern(
                regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$",
                message = "Password must contain at least one letter and one number"
                )
        String password,
        
        @NotBlank
        @Email 
        String email,
        
        @NotBlank
        @Size(min = 5, max = 50)
        String fullName,
        
        @Size(max = 10)
        String phone
) {}
