package com.MediFlow.backend.repository;

import com.MediFlow.backend.entity.Patient;
import com.MediFlow.backend.enums.PatientCondition;
import com.MediFlow.backend.enums.PatientStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByBedId(Long bedId);
    List<Patient> findByAssignedDoctorId(Long doctorId);
    List<Patient> findByDepartmentId(Long departmentId);
    long countByStatus(PatientStatus status);
    long countByCondition(PatientCondition condition);
    long countByDepartmentId(Long departmentId);
    long countByAssignedDoctorId(Long doctorId);
}
