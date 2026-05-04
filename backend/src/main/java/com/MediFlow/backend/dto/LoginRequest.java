package com.MediFlow.backend.dto;

import com.MediFlow.backend.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class LoginRequest {
    @NotBlank
    @JsonAlias("username")
    private String email;
    @NotBlank
    private String password;

    @NotNull
    private UserRole role;
}
