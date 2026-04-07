package com.MediFlow.backend.service;

import com.MediFlow.backend.entity.Equipment;
import com.MediFlow.backend.entity.Room;
import com.MediFlow.backend.entity.Ward;
import com.MediFlow.backend.exception.ResourceNotFoundException;
import com.MediFlow.backend.repository.EquipmentRepository;
import com.MediFlow.backend.repository.RoomRepository;
import com.MediFlow.backend.repository.WardRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final RoomRepository roomRepository;
    private final WardRepository wardRepository;

    public EquipmentService(EquipmentRepository equipmentRepository, RoomRepository roomRepository, WardRepository wardRepository) {
        this.equipmentRepository = equipmentRepository;
        this.roomRepository = roomRepository;
        this.wardRepository = wardRepository;
    }

    public List<Equipment> findAll() {
        return equipmentRepository.findAll();
    }

    public Equipment findById(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", id));
    }

    public List<Equipment> findByWardId(Long wardId) {
        return equipmentRepository.findByWardId(wardId);
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
        
        equipment.setWard(updatedEquipment.getWard());
        equipment.setRoom(updatedEquipment.getRoom());
        
        validateAndSetRelations(equipment);
        return equipmentRepository.save(equipment);
    }

    public void delete(Long id) {
        Equipment equipment = findById(id);
        equipmentRepository.delete(equipment);
    }
    
    private void validateAndSetRelations(Equipment equipment) {
        if (equipment.getWard() != null && equipment.getWard().getId() != null) {
            Ward ward = wardRepository.findById(equipment.getWard().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ward", equipment.getWard().getId()));
            equipment.setWard(ward);
        } else {
            equipment.setWard(null);
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
