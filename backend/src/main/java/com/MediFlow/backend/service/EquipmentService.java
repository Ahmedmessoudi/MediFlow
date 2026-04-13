package com.MediFlow.backend.service;

import com.MediFlow.backend.entity.Department;
import com.MediFlow.backend.entity.Equipment;
import com.MediFlow.backend.entity.Room;
import com.MediFlow.backend.exception.ResourceNotFoundException;
import com.MediFlow.backend.repository.DepartmentRepository;
import com.MediFlow.backend.repository.EquipmentRepository;
import com.MediFlow.backend.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final RoomRepository roomRepository;
    private final DepartmentRepository departmentRepository;

    public EquipmentService(EquipmentRepository equipmentRepository, RoomRepository roomRepository, DepartmentRepository departmentRepository) {
        this.equipmentRepository = equipmentRepository;
        this.roomRepository = roomRepository;
        this.departmentRepository = departmentRepository;
    }

    public List<Equipment> findAll() {
        return equipmentRepository.findAll();
    }

    public Equipment findById(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", id));
    }

    public List<Equipment> findByDepartmentId(Long departmentId) {
        return equipmentRepository.findByDepartmentId(departmentId);
    }

    public List<Equipment> findByRoomId(Long roomId) {
        return equipmentRepository.findByRoomId(roomId);
    }

    public Equipment create(Equipment equipment) {
        validateAndSetRelations(equipment);
        return equipmentRepository.save(equipment);
    }

    public Equipment update(Long id, Equipment updatedEquipment) {
        Equipment equipment = findById(id);
        equipment.setName(updatedEquipment.getName());
        equipment.setType(updatedEquipment.getType());
        equipment.setStatus(updatedEquipment.getStatus());
        
        equipment.setDepartment(updatedEquipment.getDepartment());
        equipment.setRoom(updatedEquipment.getRoom());
        
        validateAndSetRelations(equipment);
        return equipmentRepository.save(equipment);
    }

    public void delete(Long id) {
        Equipment equipment = findById(id);
        equipmentRepository.delete(equipment);
    }
    
    private void validateAndSetRelations(Equipment equipment) {
        if (equipment.getDepartment() != null && equipment.getDepartment().getId() != null) {
            Department department = departmentRepository.findById(equipment.getDepartment().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", equipment.getDepartment().getId()));
            equipment.setDepartment(department);
        } else {
            equipment.setDepartment(null);
        }
        
        if (equipment.getRoom() != null && equipment.getRoom().getId() != null) {
            Room room = roomRepository.findById(equipment.getRoom().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room", equipment.getRoom().getId()));
            equipment.setRoom(room);
        } else {
            equipment.setRoom(null);
        }
    }
}
