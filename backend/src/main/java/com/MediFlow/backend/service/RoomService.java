package com.MediFlow.backend.service;

import com.MediFlow.backend.entity.Department;
import com.MediFlow.backend.entity.Room;
import com.MediFlow.backend.exception.ResourceNotFoundException;
import com.MediFlow.backend.repository.DepartmentRepository;
import com.MediFlow.backend.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final DepartmentRepository departmentRepository;

    public RoomService(RoomRepository roomRepository, DepartmentRepository departmentRepository) {
        this.roomRepository = roomRepository;
        this.departmentRepository = departmentRepository;
    }

    public List<Room> findAll() {
        return roomRepository.findAll();
    }

    public Room findById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", id));
    }

    public List<Room> findByDepartmentId(Long departmentId) {
        return roomRepository.findByDepartmentId(departmentId);
    }

    public Room create(Room room) {
        if (room.getDepartment() == null || room.getDepartment().getId() == null) {
            throw new IllegalArgumentException("Room must have a department assigned");
        }
        Department department = departmentRepository.findById(room.getDepartment().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", room.getDepartment().getId()));
        room.setDepartment(department);
        return roomRepository.save(room);
    }

    public Room update(Long id, Room updatedRoom) {
        Room room = findById(id);
        room.setName(updatedRoom.getName());
        room.setCapacity(updatedRoom.getCapacity());

        if (updatedRoom.getDepartment() != null && updatedRoom.getDepartment().getId() != null) {
            Department department = departmentRepository.findById(updatedRoom.getDepartment().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", updatedRoom.getDepartment().getId()));
            room.setDepartment(department);
        }

        return roomRepository.save(room);
    }

    public void delete(Long id) {
        Room room = findById(id);
        roomRepository.delete(room);
    }
}
