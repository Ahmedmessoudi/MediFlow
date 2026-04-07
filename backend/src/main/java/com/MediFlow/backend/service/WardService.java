package com.MediFlow.backend.service;

import com.MediFlow.backend.entity.Ward;
import com.MediFlow.backend.exception.ResourceNotFoundException;
import com.MediFlow.backend.repository.RoomRepository;
import com.MediFlow.backend.repository.WardRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WardService {

    private final WardRepository wardRepository;
    private final RoomRepository roomRepository;

    public WardService(WardRepository wardRepository, RoomRepository roomRepository) {
        this.wardRepository = wardRepository;
        this.roomRepository = roomRepository;
    }

    public List<Ward> findAll() {
        return wardRepository.findAll();
    }

    public Ward findById(Long id) {
        return wardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ward", id));
    }

    public Ward create(Ward ward) {
        if (wardRepository.existsByName(ward.getName())) {
            throw new IllegalArgumentException("Ward name already exists");
        }
        return wardRepository.save(ward);
    }

    public Ward update(Long id, Ward updatedWard) {
        Ward ward = findById(id);
        if (!ward.getName().equals(updatedWard.getName()) && wardRepository.existsByName(updatedWard.getName())) {
            throw new IllegalArgumentException("Ward name already exists");
        }
        ward.setName(updatedWard.getName());
        ward.setDescription(updatedWard.getDescription());
        return wardRepository.save(ward);
    }

    public void delete(Long id) {
        Ward ward = findById(id);
        if (!roomRepository.findByWardId(id).isEmpty()) {
            throw new IllegalArgumentException("Cannot delete ward, there are rooms assigned to it.");
        }
        wardRepository.delete(ward);
    }
}
