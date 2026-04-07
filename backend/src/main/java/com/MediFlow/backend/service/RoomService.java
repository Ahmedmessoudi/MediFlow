package com.MediFlow.backend.service;

import com.MediFlow.backend.entity.Room;
import com.MediFlow.backend.entity.Ward;
import com.MediFlow.backend.exception.ResourceNotFoundException;
import com.MediFlow.backend.repository.RoomRepository;
import com.MediFlow.backend.repository.WardRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final WardRepository wardRepository;

    public RoomService(RoomRepository roomRepository, WardRepository wardRepository) {
        this.roomRepository = roomRepository;
        this.wardRepository = wardRepository;
    }

    public List<Room> findAll() {
        return roomRepository.findAll();
    }

    public Room findById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", id));
    }

    public List<Room> findByWardId(Long wardId) {
        return roomRepository.findByWardId(wardId);
    }

    public Room create(Room room) {
        if (room.getWard() == null || room.getWard().getId() == null) {
            throw new IllegalArgumentException("Room must have a ward assigned");
        }
        Ward ward = wardRepository.findById(room.getWard().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Ward", room.getWard().getId()));
        room.setWard(ward);
        return roomRepository.save(room);
    }

    public Room update(Long id, Room updatedRoom) {
        Room room = findById(id);
        room.setName(updatedRoom.getName());
        room.setCapacity(updatedRoom.getCapacity());
        
        if (updatedRoom.getWard() != null && updatedRoom.getWard().getId() != null) {
            Ward ward = wardRepository.findById(updatedRoom.getWard().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ward", updatedRoom.getWard().getId()));
            room.setWard(ward);
        }
        
        return roomRepository.save(room);
    }

    public void delete(Long id) {
        Room room = findById(id);
        roomRepository.delete(room);
    }
}
