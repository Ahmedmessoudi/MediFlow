package com.MediFlow.backend.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardStats {
    private long totalBeds;
    private long occupiedBeds;
    private long availableBeds;
    private double occupancyRate;
    private double icuUsagePercent;
    private long totalPatients;
    private long criticalPatients;
    private long totalRooms;
    private long totalWards;
    private long totalEquipment;
}
