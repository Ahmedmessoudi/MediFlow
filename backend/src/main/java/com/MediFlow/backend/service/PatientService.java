package com.MediFlow.backend.service;

import com.MediFlow.backend.dto.PatientRequest;
import com.MediFlow.backend.entity.Bed;
import com.MediFlow.backend.entity.Patient;
import com.MediFlow.backend.enums.BedStatus;
import com.MediFlow.backend.enums.BedType;
import com.MediFlow.backend.enums.PatientCondition;
import com.MediFlow.backend.exception.ResourceNotFoundException;
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
                .orElseThrow(() -> new ResourceNotFoundException("Patient", id));
    }

    public Patient create(PatientRequest request) {
        Patient patient = Patient.builder()
                .fullName(request.getFullName())
                .age(request.getAge())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .phone(request.getPhone())
                .addressCity(request.getAddressCity())
                .addressStreet(request.getAddressStreet())
                .emergencyContactName(request.getEmergencyContactName())
                .emergencyContactPhone(request.getEmergencyContactPhone())
                .medicalNotes(request.getMedicalNotes())
                .condition(request.getCondition())
                .admissionDate(LocalDateTime.now())
                .build();
        return patientRepository.save(patient);
    }

    public Patient update(Long id, PatientRequest request) {
        Patient patient = findById(id);
        patient.setFullName(request.getFullName());
        patient.setAge(request.getAge());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setPhone(request.getPhone());
        patient.setAddressCity(request.getAddressCity());
        patient.setAddressStreet(request.getAddressStreet());
        patient.setEmergencyContactName(request.getEmergencyContactName());
        patient.setEmergencyContactPhone(request.getEmergencyContactPhone());
        patient.setMedicalNotes(request.getMedicalNotes());
        patient.setCondition(request.getCondition());
        return patientRepository.save(patient);
    }

    public Patient updateCondition(Long id, PatientCondition condition) {
        Patient patient = findById(id);
        patient.setCondition(condition);
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
            throw new IllegalArgumentException("Patient already has a bed assigned");
        }

        BedType requiredType = (patient.getCondition() == PatientCondition.CRITICAL) ? BedType.ICU : BedType.NORMAL;

        Bed bed = bedRepository.findFirstByTypeAndStatus(requiredType, BedStatus.AVAILABLE)
                .orElseThrow(() -> new IllegalArgumentException("No " + requiredType + " beds available! Alert: Patient waiting for bed assignment."));

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
}
