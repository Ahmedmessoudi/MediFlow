package com.MediFlow.backend.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiSummaryResponse {
    private Long patientId;
    private String patientName;
    private String clinicalSummary;
    private String recommendations;
    private String generatedAt;
}
