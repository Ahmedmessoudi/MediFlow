package com.MediFlow.backend.dto;

import lombok.*;

import java.util.List;

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
    private long totalDepartments;
    private long totalEquipment;

    private List<DepartmentStat> departmentStats;
    private List<DoctorWorkload> doctorWorkloads;
}
