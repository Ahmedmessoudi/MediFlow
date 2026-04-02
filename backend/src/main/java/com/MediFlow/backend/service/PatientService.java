package com.MediFlow.backend.service;

import com.MediFlow.backend.entity.Bed;
import com.MediFlow.backend.entity.Patient;
import com.MediFlow.backend.enums.BedStatus;
import com.MediFlow.backend.enums.BedType;
import com.MediFlow.backend.enums.PatientCondition;
import com.MediFlow.backend.repository.BedRepository;
import com.MediFlow.backend.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final BedRepository bedRepository;

    public PatientService(PatientRepository patientRepository, BedRepository bedRepository) {
        this.patientRepository = patientRepository;
        this.bedRepository = bedRepository;
    }

    public List<Patient> findAll() {
        return patientRepository.findAll();
    }

    public Patient findById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
    }

    public Patient create(Patient patient) {
        patient.setAdmissionDate(LocalDateTime.now());
        return patientRepository.save(patient);
    }

    public Patient update(Long id, Patient updatedPatient) {
        Patient patient = findById(id);
        patient.setName(updatedPatient.getName());
        patient.setAge(updatedPatient.getAge());
        patient.setCondition(updatedPatient.getCondition());
        return patientRepository.save(patient);
    }

    public void delete(Long id) {
        Patient patient = findById(id);
        if (patient.getBed() != null) {
            Bed bed = patient.getBed();
            bed.setStatus(BedStatus.AVAILABLE);
            bedRepository.save(bed);
        }
        patientRepository.deleteById(id);
    }

    @Transactional
    public Patient allocateBed(Long patientId) {
        Patient patient = findById(patientId);

        if (patient.getBed() != null) {
            throw new RuntimeException("Patient already has a bed assigned");
        }

        // Smart allocation: CRITICAL → ICU, otherwise → NORMAL
        BedType requiredType = (patient.getCondition() == PatientCondition.CRITICAL) ? BedType.ICU : BedType.NORMAL;

        Bed bed = bedRepository.findFirstByTypeAndStatus(requiredType, BedStatus.AVAILABLE)
                .orElseThrow(() -> new RuntimeException("No " + requiredType + " beds available! Alert: Patient waiting for bed assignment."));

        bed.setStatus(BedStatus.OCCUPIED);
        bedRepository.save(bed);

        patient.setBed(bed);
        return patientRepository.save(patient);
    }

    @Transactional
    public Patient discharge(Long patientId) {
        Patient patient = findById(patientId);

        if (patient.getBed() != null) {
            Bed bed = patient.getBed();
            bed.setStatus(BedStatus.AVAILABLE);
            bedRepository.save(bed);
            patient.setBed(null);
        }

        patient.setDischargeDate(LocalDateTime.now());
        return patientRepository.save(patient);
    }

    public Patient markCritical(Long patientId) {
        Patient patient = findById(patientId);
        patient.setCondition(PatientCondition.CRITICAL);
        return patientRepository.save(patient);
    }
}
