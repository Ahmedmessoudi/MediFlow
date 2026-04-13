package com.MediFlow.backend.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DepartmentStat {
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private long patientCount;
    private long bedCount;
    private long occupiedBeds;
    private double occupancyRate;
}
