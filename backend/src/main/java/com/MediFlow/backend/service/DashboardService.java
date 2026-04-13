package com.MediFlow.backend.service;

import com.MediFlow.backend.dto.DashboardStats;
import com.MediFlow.backend.dto.DepartmentStat;
import com.MediFlow.backend.dto.DoctorWorkload;
import com.MediFlow.backend.entity.Bed;
import com.MediFlow.backend.entity.Department;
import com.MediFlow.backend.entity.User;
import com.MediFlow.backend.enums.BedStatus;
import com.MediFlow.backend.enums.BedType;
import com.MediFlow.backend.enums.PatientCondition;
import com.MediFlow.backend.enums.UserRole;
import com.MediFlow.backend.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final BedRepository bedRepository;
    private final PatientRepository patientRepository;
    private final RoomRepository roomRepository;
    private final DepartmentRepository departmentRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;

    public DashboardService(BedRepository bedRepository,
                            PatientRepository patientRepository,
                            RoomRepository roomRepository,
                            DepartmentRepository departmentRepository,
                            EquipmentRepository equipmentRepository,
                            UserRepository userRepository) {
        this.bedRepository = bedRepository;
        this.patientRepository = patientRepository;
        this.roomRepository = roomRepository;
        this.departmentRepository = departmentRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
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
        long criticalPatients = patientRepository.countByCondition(PatientCondition.CRITICAL);

        // Department-wise stats
        List<Department> departments = departmentRepository.findAll();
        List<Bed> allBeds = bedRepository.findAll();
        List<DepartmentStat> departmentStats = departments.stream().map(dept -> {
            long deptPatients = patientRepository.countByDepartmentId(dept.getId());
            List<Bed> deptBeds = allBeds.stream()
                    .filter(b -> b.getRoom() != null 
                            && b.getRoom().getDepartment() != null
                            && dept.getId().equals(b.getRoom().getDepartment().getId()))
                    .collect(Collectors.toList());
            long deptBedCount = deptBeds.size();
            long deptOccupied = deptBeds.stream()
                    .filter(b -> b.getStatus() != null && b.getStatus() == BedStatus.OCCUPIED)
                    .count();
            double deptOccupancy = deptBedCount > 0 ? (double) deptOccupied / deptBedCount * 100 : 0;

            return DepartmentStat.builder()
                    .departmentId(dept.getId())
                    .departmentName(dept.getName())
                    .departmentCode(dept.getCode())
                    .patientCount(deptPatients)
                    .bedCount(deptBedCount)
                    .occupiedBeds(deptOccupied)
                    .occupancyRate(Math.round(deptOccupancy * 10.0) / 10.0)
                    .build();
        }).collect(Collectors.toList());

        // Doctor workloads
        List<User> doctors = userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.DOCTOR)
                .collect(Collectors.toList());
        List<DoctorWorkload> doctorWorkloads = doctors.stream().map(doc -> {
            long docPatients = patientRepository.countByAssignedDoctorId(doc.getId());
            return DoctorWorkload.builder()
                    .doctorId(doc.getId())
                    .doctorName(doc.getFullName())
                    .patientCount(docPatients)
                    .build();
        }).collect(Collectors.toList());

        return DashboardStats.builder()
                .totalBeds(totalBeds)
                .occupiedBeds(occupiedBeds)
                .availableBeds(availableBeds)
                .occupancyRate(Math.round(occupancyRate * 10.0) / 10.0)
                .icuUsagePercent(Math.round(icuUsagePercent * 10.0) / 10.0)
                .totalPatients(totalPatients)
                .criticalPatients(criticalPatients)
                .totalRooms(roomRepository.count())
                .totalDepartments(departmentRepository.count())
                .totalEquipment(equipmentRepository.count())
                .departmentStats(departmentStats)
                .doctorWorkloads(doctorWorkloads)
                .build();
    }

    /**
     * Doctor-specific stats: only patients assigned to this doctor
     */
    public DashboardStats getDoctorStats(Long doctorId) {
        long myPatients = patientRepository.countByAssignedDoctorId(doctorId);
        long totalBeds = bedRepository.count();
        long availableBeds = bedRepository.countByStatus(BedStatus.AVAILABLE);

        return DashboardStats.builder()
                .totalBeds(totalBeds)
                .occupiedBeds(bedRepository.countByStatus(BedStatus.OCCUPIED))
                .availableBeds(availableBeds)
                .occupancyRate(totalBeds > 0 ? Math.round((double)(totalBeds - availableBeds) / totalBeds * 1000.0) / 10.0 : 0)
                .icuUsagePercent(0)
                .totalPatients(myPatients)
                .criticalPatients(patientRepository.findByAssignedDoctorId(doctorId).stream()
                        .filter(p -> p.getCondition() != null && p.getCondition() == PatientCondition.CRITICAL).count())
                .totalRooms(roomRepository.count())
                .totalDepartments(departmentRepository.count())
                .totalEquipment(equipmentRepository.count())
                .build();
    }
}
