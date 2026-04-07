package com.MediFlow.backend.repository;

import com.MediFlow.backend.entity.Ward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WardRepository extends JpaRepository<Ward, Long> {
    Optional<Ward> findByName(String name);
    boolean existsByName(String name);
}
