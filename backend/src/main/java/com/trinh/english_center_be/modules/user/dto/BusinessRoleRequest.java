package com.trinh.english_center_be.modules.user.dto;

import com.trinh.english_center_be.shared.enums.BusinessRoles;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class BusinessRoleRequest {

    @NotNull(message = "Code must not be null")
    private BusinessRoles code;

    @Size(max = 500, message = "Description must be at most 500 characters")
    private String description;

    @Builder.Default
    @Column(name = "active", nullable = false)
    private Boolean active = true;
}
