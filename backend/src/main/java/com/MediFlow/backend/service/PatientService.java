package com.MediFlow.backend.service;

import com.MediFlow.backend.dto.PatientRequest;
import com.MediFlow.backend.entity.Bed;
import com.MediFlow.backend.entity.Department;
import com.MediFlow.backend.entity.Patient;
import com.MediFlow.backend.entity.User;
import com.MediFlow.backend.enums.*;
import com.MediFlow.backend.exception.ResourceNotFoundException;
import com.MediFlow.backend.repository.BedRepository;
import com.MediFlow.backend.repository.DepartmentRepository;
import com.MediFlow.backend.repository.PatientRepository;
import com.MediFlow.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final BedRepository bedRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public PatientService(PatientRepository patientRepository,
                          BedRepository bedRepository,
                          DepartmentRepository departmentRepository,
                          UserRepository userRepository,
                          NotificationService notificationService) {
        this.patientRepository = patientRepository;
        this.bedRepository = bedRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public List<Patient> findAll() {
        return patientRepository.findAll();
    }

    public Patient findById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", id));
    }

    public List<Patient> findByAssignedDoctorId(Long doctorId) {
        return patientRepository.findByAssignedDoctorId(doctorId);
    }

    public List<Patient> findByDepartmentId(Long departmentId) {
        return patientRepository.findByDepartmentId(departmentId);
    }

    public Patient create(PatientRequest request) {
        Patient.PatientBuilder builder = Patient.builder()
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
                .status(request.getStatus() != null ? request.getStatus() : PatientStatus.ADMITTED)
                .priorityLevel(request.getPriorityLevel() != null ? request.getPriorityLevel() : PriorityLevel.MEDIUM)
                .admissionDate(LocalDateTime.now());

        // Resolve department
        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", request.getDepartmentId()));
            builder.department(dept);
        }

        // Resolve assigned doctor
        if (request.getAssignedDoctorId() != null) {
            User doctor = userRepository.findById(request.getAssignedDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.getAssignedDoctorId()));
            builder.assignedDoctor(doctor);

            // Send notification
            notificationService.sendNotification(
                    "New patient '" + request.getFullName() + "' assigned to Dr. " + doctor.getFullName(),
                    NotificationType.PATIENT_ASSIGNED,
                    "DOCTOR,ADMIN"
            );
        }

        return patientRepository.save(builder.build());
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

        if (request.getStatus() != null) {
            patient.setStatus(request.getStatus());
        }
        if (request.getPriorityLevel() != null) {
            patient.setPriorityLevel(request.getPriorityLevel());
        }

        // Update department
        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", request.getDepartmentId()));
            patient.setDepartment(dept);
        }

        // Update assigned doctor
        if (request.getAssignedDoctorId() != null) {
            User doctor = userRepository.findById(request.getAssignedDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.getAssignedDoctorId()));
            patient.setAssignedDoctor(doctor);
        }

        return patientRepository.save(patient);
    }

    public Patient updateCondition(Long id, PatientCondition condition) {
        Patient patient = findById(id);
        patient.setCondition(condition);

        if (condition == PatientCondition.CRITICAL) {
            patient.setPriorityLevel(PriorityLevel.HIGH);
            notificationService.sendNotification(
                    "⚠️ CRITICAL: Patient '" + patient.getFullName() + "' marked as CRITICAL",
                    NotificationType.CRITICAL_ALERT,
                    "ALL"
            );
        }

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
        patient.setStatus(PatientStatus.UNDER_TREATMENT);

        notificationService.sendNotification(
                "Bed " + bed.getBedNumber() + " assigned to patient '" + patient.getFullName() + "'",
                NotificationType.BED_CHANGE,
                "ADMIN,NURSE"
        );

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

            notificationService.sendNotification(
                    "Bed " + bed.getBedNumber() + " now available (patient '" + patient.getFullName() + "' discharged)",
                    NotificationType.BED_CHANGE,
                    "ADMIN,NURSE"
            );
        }

        patient.setDischargeDate(LocalDateTime.now());
        patient.setStatus(PatientStatus.DISCHARGED);
        return patientRepository.save(patient);
    }
}
