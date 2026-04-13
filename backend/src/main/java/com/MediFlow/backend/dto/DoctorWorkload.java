package com.MediFlow.backend.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DoctorWorkload {
    private Long doctorId;
    private String doctorName;
    private long patientCount;
}
