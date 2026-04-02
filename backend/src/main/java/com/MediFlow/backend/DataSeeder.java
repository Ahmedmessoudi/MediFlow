package com.MediFlow.backend;

import com.MediFlow.backend.entity.*;
import com.MediFlow.backend.enums.*;
import com.MediFlow.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;
    private final PatientRepository patientRepository;
    private final EquipmentRepository equipmentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      RoomRepository roomRepository,
                      BedRepository bedRepository,
                      PatientRepository patientRepository,
                      EquipmentRepository equipmentRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.bedRepository = bedRepository;
        this.patientRepository = patientRepository;
        this.equipmentRepository = equipmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Only seed if database is empty
        if (userRepository.count() > 0) return;

        // --- Users ---
        userRepository.save(User.builder().username("admin").password(passwordEncoder.encode("admin")).role(UserRole.ADMIN).build());
        userRepository.save(User.builder().username("dr.smith").password(passwordEncoder.encode("doctor")).role(UserRole.DOCTOR).build());
        userRepository.save(User.builder().username("nurse.jones").password(passwordEncoder.encode("nurse")).role(UserRole.NURSE).build());
        userRepository.save(User.builder().username("dr.williams").password(passwordEncoder.encode("doctor")).role(UserRole.DOCTOR).build());
        userRepository.save(User.builder().username("receptionist01").password(passwordEncoder.encode("reception")).role(UserRole.RECEPTIONIST).build());

        // --- Rooms ---
        Room roomA101 = roomRepository.save(Room.builder().name("Room 101").ward("Ward A").capacity(4).build());
        Room roomA102 = roomRepository.save(Room.builder().name("Room 102").ward("Ward A").capacity(2).build());
        Room icuSuite = roomRepository.save(Room.builder().name("ICU Suite 1").ward("ICU").capacity(6).build());
        Room roomB201 = roomRepository.save(Room.builder().name("Room 201").ward("Ward B").capacity(4).build());
        Room roomC301 = roomRepository.save(Room.builder().name("Room 301").ward("Ward C").capacity(3).build());
        Room erBay = roomRepository.save(Room.builder().name("ER Bay 1").ward("Emergency").capacity(8).build());

        // --- Beds ---
        Bed bedA101 = bedRepository.save(Bed.builder().bedNumber("A-101").type(BedType.NORMAL).status(BedStatus.OCCUPIED).room(roomA101).build());
        bedRepository.save(Bed.builder().bedNumber("A-102").type(BedType.NORMAL).status(BedStatus.AVAILABLE).room(roomA101).build());
        Bed bedA103 = bedRepository.save(Bed.builder().bedNumber("A-103").type(BedType.NORMAL).status(BedStatus.OCCUPIED).room(roomA101).build());
        bedRepository.save(Bed.builder().bedNumber("A-104").type(BedType.NORMAL).status(BedStatus.AVAILABLE).room(roomA101).build());

        bedRepository.save(Bed.builder().bedNumber("A-110").type(BedType.NORMAL).status(BedStatus.AVAILABLE).room(roomA102).build());
        bedRepository.save(Bed.builder().bedNumber("A-111").type(BedType.NORMAL).status(BedStatus.AVAILABLE).room(roomA102).build());

        Bed bedICU01 = bedRepository.save(Bed.builder().bedNumber("ICU-01").type(BedType.ICU).status(BedStatus.OCCUPIED).room(icuSuite).build());
        bedRepository.save(Bed.builder().bedNumber("ICU-02").type(BedType.ICU).status(BedStatus.AVAILABLE).room(icuSuite).build());
        Bed bedICU03 = bedRepository.save(Bed.builder().bedNumber("ICU-03").type(BedType.ICU).status(BedStatus.OCCUPIED).room(icuSuite).build());
        bedRepository.save(Bed.builder().bedNumber("ICU-04").type(BedType.ICU).status(BedStatus.AVAILABLE).room(icuSuite).build());

        bedRepository.save(Bed.builder().bedNumber("B-201").type(BedType.NORMAL).status(BedStatus.AVAILABLE).room(roomB201).build());
        Bed bedB202 = bedRepository.save(Bed.builder().bedNumber("B-202").type(BedType.NORMAL).status(BedStatus.OCCUPIED).room(roomB201).build());

        // --- Patients ---
        patientRepository.save(Patient.builder().name("John Doe").age(45).condition(PatientCondition.NORMAL).admissionDate(LocalDateTime.now().minusDays(3)).bed(bedA101).build());
        patientRepository.save(Patient.builder().name("Jane Smith").age(32).condition(PatientCondition.CRITICAL).admissionDate(LocalDateTime.now().minusDays(1)).bed(bedICU01).build());
        patientRepository.save(Patient.builder().name("Robert Brown").age(67).condition(PatientCondition.SERIOUS).admissionDate(LocalDateTime.now().minusDays(5)).bed(bedB202).build());
        patientRepository.save(Patient.builder().name("Emily Davis").age(28).condition(PatientCondition.NORMAL).admissionDate(LocalDateTime.now().minusDays(2)).bed(bedA103).build());
        patientRepository.save(Patient.builder().name("Michael Wilson").age(54).condition(PatientCondition.CRITICAL).admissionDate(LocalDateTime.now().minusDays(1)).bed(bedICU03).build());
        patientRepository.save(Patient.builder().name("Sarah Johnson").age(41).condition(PatientCondition.SERIOUS).admissionDate(LocalDateTime.now()).build());

        // --- Equipment ---
        equipmentRepository.save(Equipment.builder().name("Ventilator V-100").type("Ventilator").status(EquipmentStatus.IN_USE).room(icuSuite).build());
        equipmentRepository.save(Equipment.builder().name("Monitor M-200").type("Monitor").status(EquipmentStatus.AVAILABLE).room(roomA101).build());
        equipmentRepository.save(Equipment.builder().name("Defibrillator D-50").type("Defibrillator").status(EquipmentStatus.AVAILABLE).room(erBay).build());
        equipmentRepository.save(Equipment.builder().name("Infusion Pump IP-30").type("Pump").status(EquipmentStatus.IN_USE).room(icuSuite).build());
        equipmentRepository.save(Equipment.builder().name("Ventilator V-101").type("Ventilator").status(EquipmentStatus.AVAILABLE).room(icuSuite).build());
        equipmentRepository.save(Equipment.builder().name("X-Ray XR-01").type("Imaging").status(EquipmentStatus.AVAILABLE).room(erBay).build());

        System.out.println("✅ Database seeded with sample data!");
    }
}
