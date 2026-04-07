package com.MediFlow.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RegisterRequest {
    @NotBlank
    private String username;
    @NotBlank
    private String fullName;
    
    @NotBlank
    @jakarta.validation.constraints.Email
    private String email;

    @NotBlank
    private String password;
    @NotNull
    private String role;
}
