package com.MediFlow.backend.repository;

import com.MediFlow.backend.entity.Equipment;
import com.MediFlow.backend.enums.EquipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByStatus(EquipmentStatus status);
    List<Equipment> findByDepartmentId(Long departmentId);
    List<Equipment> findByRoomId(Long roomId);
}
