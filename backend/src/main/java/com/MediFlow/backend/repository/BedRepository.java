package com.MediFlow.backend.repository;

import com.MediFlow.backend.entity.Bed;
import com.MediFlow.backend.enums.BedStatus;
import com.MediFlow.backend.enums.BedType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BedRepository extends JpaRepository<Bed, Long> {
    List<Bed> findByStatus(BedStatus status);
    List<Bed> findByTypeAndStatus(BedType type, BedStatus status);
    Optional<Bed> findFirstByTypeAndStatus(BedType type, BedStatus status);
    long countByStatus(BedStatus status);
    long countByType(BedType type);
    long countByTypeAndStatus(BedType type, BedStatus status);
}
