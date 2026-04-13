package com.MediFlow.backend.entity;

import com.MediFlow.backend.enums.Gender;
import com.MediFlow.backend.enums.PatientCondition;
import com.MediFlow.backend.enums.PatientStatus;
import com.MediFlow.backend.enums.PriorityLevel;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    private Integer age;

    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String phone;

    private String addressCity;

    private String addressStreet;

    private String emergencyContactName;

    private String emergencyContactPhone;

    @Column(columnDefinition = "TEXT")
    private String medicalNotes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PatientCondition condition;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PatientStatus status = PatientStatus.ADMITTED;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PriorityLevel priorityLevel = PriorityLevel.MEDIUM;

    @Column(nullable = false)
    private LocalDateTime admissionDate;

    private LocalDateTime dischargeDate;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bed_id", unique = true)
    private Bed bed;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_doctor_id")
    private User assignedDoctor;
}
