package com.MediFlow.backend.service;

import com.MediFlow.backend.entity.Bed;
import com.MediFlow.backend.enums.BedStatus;
import com.MediFlow.backend.repository.BedRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BedService {

    private final BedRepository bedRepository;

    public BedService(BedRepository bedRepository) {
        this.bedRepository = bedRepository;
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
        return bedRepository.save(bed);
    }

    public Bed update(Long id, Bed updatedBed) {
        Bed bed = findById(id);
        bed.setType(updatedBed.getType());
        bed.setStatus(updatedBed.getStatus());
        bed.setBedNumber(updatedBed.getBedNumber());
        bed.setRoom(updatedBed.getRoom());
        return bedRepository.save(bed);
    }

    public void delete(Long id) {
        bedRepository.deleteById(id);
    }
}
