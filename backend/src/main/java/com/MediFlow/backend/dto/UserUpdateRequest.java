package com.MediFlow.backend.dto;

import com.MediFlow.backend.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserUpdateRequest {
    @NotBlank
    private String fullName;

    @NotBlank
    @Email
    private String email;

    private UserRole role;
    
    // Optional password update
    private String password;
}
