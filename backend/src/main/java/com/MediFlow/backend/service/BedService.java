package com.MediFlow.backend.service;

import com.MediFlow.backend.entity.Bed;
import com.MediFlow.backend.entity.Room;
import com.MediFlow.backend.enums.BedStatus;
import com.MediFlow.backend.repository.BedRepository;
import com.MediFlow.backend.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BedService {

    private final BedRepository bedRepository;
    private final RoomRepository roomRepository;

    public BedService(BedRepository bedRepository, RoomRepository roomRepository) {
        this.bedRepository = bedRepository;
        this.roomRepository = roomRepository;
    }

    public List<Bed> findAll() {
        return bedRepository.findAll();
    }

    public Bed findById(Long id) {
        return bedRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bed not found with id: " + id));
    }

    public List<Bed> findAvailable() {
        return bedRepository.findByStatus(BedStatus.AVAILABLE);
    }

    public Bed create(Bed bed) {
        Room room = resolveRoom(bed.getRoom());
        ensureRoomCapacity(room);
        bed.setRoom(room);
        return bedRepository.save(bed);
    }

    public Bed update(Long id, Bed updatedBed) {
        Bed bed = findById(id);
        bed.setType(updatedBed.getType());
        bed.setStatus(updatedBed.getStatus());
        bed.setBedNumber(updatedBed.getBedNumber());
        Room room = resolveRoom(updatedBed.getRoom());
        if (bed.getRoom() == null || !bed.getRoom().getId().equals(room.getId())) {
            ensureRoomCapacity(room);
            bed.setRoom(room);
        }
        return bedRepository.save(bed);
    }

    public void delete(Long id) {
        bedRepository.deleteById(id);
    }

    private Room resolveRoom(Room room) {
        if (room == null || room.getId() == null) {
            throw new IllegalArgumentException("Room is required for a bed");
        }
        return roomRepository.findById(room.getId())
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + room.getId()));
    }

    private void ensureRoomCapacity(Room room) {
        long currentCount = bedRepository.countByRoomId(room.getId());
        if (currentCount >= room.getCapacity()) {
            throw new IllegalArgumentException("Room capacity exceeded. Capacity: " + room.getCapacity());
        }
    }
}
