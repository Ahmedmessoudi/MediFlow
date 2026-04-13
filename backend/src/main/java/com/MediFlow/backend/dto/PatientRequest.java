package com.MediFlow.backend.dto;

import com.MediFlow.backend.enums.Gender;
import com.MediFlow.backend.enums.PatientCondition;
import com.MediFlow.backend.enums.PatientStatus;
import com.MediFlow.backend.enums.PriorityLevel;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PatientRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotNull(message = "Age is required")
    @Min(value = 0, message = "Age must be positive")
    @Max(value = 150, message = "Age must be realistic")
    private Integer age;

    @NotNull(message = "Condition is required")
    private PatientCondition condition;

    private PatientStatus status;

    private PriorityLevel priorityLevel;

    private Long departmentId;

    private Long assignedDoctorId;

    private LocalDate dateOfBirth;

    private Gender gender;

    @Pattern(regexp = "^[+]?[0-9\\s\\-()]{7,15}$", message = "Invalid phone number format")
    private String phone;

    private String addressCity;

    private String addressStreet;

    private String emergencyContactName;

    @Pattern(regexp = "^[+]?[0-9\\s\\-()]{7,15}$", message = "Invalid phone number format")
    private String emergencyContactPhone;

    private String medicalNotes;
}
