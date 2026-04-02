package com.MediFlow.backend.service;

import com.MediFlow.backend.dto.DashboardStats;
import com.MediFlow.backend.enums.BedStatus;
import com.MediFlow.backend.enums.BedType;
import com.MediFlow.backend.enums.PatientCondition;
import com.MediFlow.backend.repository.BedRepository;
import com.MediFlow.backend.repository.EquipmentRepository;
import com.MediFlow.backend.repository.PatientRepository;
import com.MediFlow.backend.repository.RoomRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final BedRepository bedRepository;
    private final PatientRepository patientRepository;
    private final RoomRepository roomRepository;
    private final EquipmentRepository equipmentRepository;

    public DashboardService(BedRepository bedRepository,
                            PatientRepository patientRepository,
                            RoomRepository roomRepository,
                            EquipmentRepository equipmentRepository) {
        this.bedRepository = bedRepository;
        this.patientRepository = patientRepository;
        this.roomRepository = roomRepository;
        this.equipmentRepository = equipmentRepository;
    }

    public DashboardStats getStats() {
        long totalBeds = bedRepository.count();
        long occupiedBeds = bedRepository.countByStatus(BedStatus.OCCUPIED);
        long availableBeds = bedRepository.countByStatus(BedStatus.AVAILABLE);
        double occupancyRate = totalBeds > 0 ? (double) occupiedBeds / totalBeds * 100 : 0;

        long totalIcuBeds = bedRepository.countByType(BedType.ICU);
        long occupiedIcuBeds = bedRepository.countByTypeAndStatus(BedType.ICU, BedStatus.OCCUPIED);
        double icuUsagePercent = totalIcuBeds > 0 ? (double) occupiedIcuBeds / totalIcuBeds * 100 : 0;

        long totalPatients = patientRepository.count();
        long criticalPatients = patientRepository.findAll().stream()
                .filter(p -> p.getCondition() == PatientCondition.CRITICAL)
                .count();

        return DashboardStats.builder()
                .totalBeds(totalBeds)
                .occupiedBeds(occupiedBeds)
                .availableBeds(availableBeds)
                .occupancyRate(Math.round(occupancyRate * 10.0) / 10.0)
                .icuUsagePercent(Math.round(icuUsagePercent * 10.0) / 10.0)
                .totalPatients(totalPatients)
                .criticalPatients(criticalPatients)
                .totalRooms(roomRepository.count())
                .totalEquipment(equipmentRepository.count())
                .build();
    }
}
