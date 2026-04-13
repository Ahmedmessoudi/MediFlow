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
    private final DepartmentRepository departmentRepository;
    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;
    private final PatientRepository patientRepository;
    private final EquipmentRepository equipmentRepository;
    private final SystemSettingsRepository settingsRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      DepartmentRepository departmentRepository,
                      RoomRepository roomRepository,
                      BedRepository bedRepository,
                      PatientRepository patientRepository,
                      EquipmentRepository equipmentRepository,
                      SystemSettingsRepository settingsRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.roomRepository = roomRepository;
        this.bedRepository = bedRepository;
        this.patientRepository = patientRepository;
        this.equipmentRepository = equipmentRepository;
        this.settingsRepository = settingsRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        System.out.println("🌱 Starting selective database seeding...");

        // --- 1. Users ---
        if (userRepository.count() == 0) {
            userRepository.save(User.builder().username("admin").fullName("System Admin").email("admin@mediflow.com").password(passwordEncoder.encode("admin")).role(UserRole.ADMIN).active(true).build());
            userRepository.save(User.builder().username("dr.smith").fullName("Dr. John Smith").email("dr.smith@mediflow.com").password(passwordEncoder.encode("doctor")).role(UserRole.DOCTOR).active(true).build());
            userRepository.save(User.builder().username("nurse.jones").fullName("Nurse Sarah Jones").email("nurse.jones@mediflow.com").password(passwordEncoder.encode("nurse")).role(UserRole.NURSE).active(true).build());
            userRepository.save(User.builder().username("dr.williams").fullName("Dr. Mark Williams").email("dr.williams@mediflow.com").password(passwordEncoder.encode("doctor")).role(UserRole.DOCTOR).active(true).build());
            userRepository.save(User.builder().username("receptionist01").fullName("Anna Frontdesk").email("anna@mediflow.com").password(passwordEncoder.encode("reception")).role(UserRole.RECEPTIONIST).active(true).build());
            System.out.println("✅ Users seeded.");
        }

        // --- 2. Departments ---
        if (departmentRepository.count() == 0) {
            departmentRepository.save(Department.builder().name("Cardiology Department").code("DEP-CARD").description("Heart and cardiovascular care").build());
            departmentRepository.save(Department.builder().name("Orthopedics Department").code("DEP-ORTHO").description("Bone and joint treatment").build());
            departmentRepository.save(Department.builder().name("Neurology Department").code("DEP-NEURO").description("Brain and nervous system care").build());
            departmentRepository.save(Department.builder().name("Pediatrics Department").code("DEP-PEDI").description("Children's healthcare").build());
            departmentRepository.save(Department.builder().name("Emergency Department").code("DEP-ER").description("Emergency and trauma care").build());
            System.out.println("✅ Departments seeded.");
        }

        // --- 3. Rooms ---
        if (roomRepository.count() == 0) {
            Department cardiology = departmentRepository.findAll().stream().filter(d -> d.getCode().equals("DEP-CARD")).findFirst().orElse(null);
            Department neurology = departmentRepository.findAll().stream().filter(d -> d.getCode().equals("DEP-NEURO")).findFirst().orElse(null);
            Department pediatrics = departmentRepository.findAll().stream().filter(d -> d.getCode().equals("DEP-PEDI")).findFirst().orElse(null);
            Department orthopedics = departmentRepository.findAll().stream().filter(d -> d.getCode().equals("DEP-ORTHO")).findFirst().orElse(null);
            Department emergency = departmentRepository.findAll().stream().filter(d -> d.getCode().equals("DEP-ER")).findFirst().orElse(null);

            if (cardiology != null) {
                roomRepository.save(Room.builder().name("Room 101").department(cardiology).capacity(4).build());
                roomRepository.save(Room.builder().name("Room 102").department(cardiology).capacity(2).build());
            }
            if (neurology != null) {
                roomRepository.save(Room.builder().name("ICU Suite 1").department(neurology).capacity(6).build());
            }
            if (pediatrics != null) {
                roomRepository.save(Room.builder().name("Room 201").department(pediatrics).capacity(4).build());
            }
            if (orthopedics != null) {
                roomRepository.save(Room.builder().name("Room 301").department(orthopedics).capacity(3).build());
            }
            if (emergency != null) {
                roomRepository.save(Room.builder().name("ER Bay 1").department(emergency).capacity(8).build());
            }
            System.out.println("✅ Rooms seeded.");
        }

        // --- 4. Beds ---
        if (bedRepository.count() == 0) {
            Room room101 = roomRepository.findAll().stream().filter(r -> r.getName().equals("Room 101")).findFirst().orElse(null);
            Room room102 = roomRepository.findAll().stream().filter(r -> r.getName().equals("Room 102")).findFirst().orElse(null);
            Room icuSuite = roomRepository.findAll().stream().filter(r -> r.getName().equals("ICU Suite 1")).findFirst().orElse(null);
            Room room201 = roomRepository.findAll().stream().filter(r -> r.getName().equals("Room 201")).findFirst().orElse(null);

            if (room101 != null) {
                bedRepository.save(Bed.builder().bedNumber("A-101").type(BedType.NORMAL).status(BedStatus.OCCUPIED).room(room101).build());
                bedRepository.save(Bed.builder().bedNumber("A-102").type(BedType.NORMAL).status(BedStatus.AVAILABLE).room(room101).build());
                bedRepository.save(Bed.builder().bedNumber("A-103").type(BedType.NORMAL).status(BedStatus.OCCUPIED).room(room101).build());
                bedRepository.save(Bed.builder().bedNumber("A-104").type(BedType.NORMAL).status(BedStatus.AVAILABLE).room(room101).build());
            }
            if (room102 != null) {
                bedRepository.save(Bed.builder().bedNumber("A-110").type(BedType.NORMAL).status(BedStatus.AVAILABLE).room(room102).build());
                bedRepository.save(Bed.builder().bedNumber("A-111").type(BedType.NORMAL).status(BedStatus.AVAILABLE).room(room102).build());
            }
            if (icuSuite != null) {
                bedRepository.save(Bed.builder().bedNumber("ICU-01").type(BedType.ICU).status(BedStatus.OCCUPIED).room(icuSuite).build());
                bedRepository.save(Bed.builder().bedNumber("ICU-02").type(BedType.ICU).status(BedStatus.AVAILABLE).room(icuSuite).build());
                bedRepository.save(Bed.builder().bedNumber("ICU-03").type(BedType.ICU).status(BedStatus.OCCUPIED).room(icuSuite).build());
                bedRepository.save(Bed.builder().bedNumber("ICU-04").type(BedType.ICU).status(BedStatus.AVAILABLE).room(icuSuite).build());
            }
            if (room201 != null) {
                bedRepository.save(Bed.builder().bedNumber("B-201").type(BedType.NORMAL).status(BedStatus.AVAILABLE).room(room201).build());
                bedRepository.save(Bed.builder().bedNumber("B-202").type(BedType.NORMAL).status(BedStatus.OCCUPIED).room(room201).build());
            }
            System.out.println("✅ Beds seeded.");
        }

        // --- 5. Patients ---
        if (patientRepository.count() == 0) {
            Department cardiology = departmentRepository.findAll().stream().filter(d -> d.getCode().equals("DEP-CARD")).findFirst().orElse(null);
            Department neurology = departmentRepository.findAll().stream().filter(d -> d.getCode().equals("DEP-NEURO")).findFirst().orElse(null);
            Department pediatrics = departmentRepository.findAll().stream().filter(d -> d.getCode().equals("DEP-PEDI")).findFirst().orElse(null);
            Department emergency = departmentRepository.findAll().stream().filter(d -> d.getCode().equals("DEP-ER")).findFirst().orElse(null);
            Department orthopedics = departmentRepository.findAll().stream().filter(d -> d.getCode().equals("DEP-ORTHO")).findFirst().orElse(null);

            User drSmith = userRepository.findByUsername("dr.smith").orElse(null);
            User drWilliams = userRepository.findByUsername("dr.williams").orElse(null);

            Bed bedA101 = bedRepository.findAll().stream().filter(b -> b.getBedNumber().equals("A-101")).findFirst().orElse(null);
            Bed bedICU01 = bedRepository.findAll().stream().filter(b -> b.getBedNumber().equals("ICU-01")).findFirst().orElse(null);
            Bed bedB202 = bedRepository.findAll().stream().filter(b -> b.getBedNumber().equals("B-202")).findFirst().orElse(null);
            Bed bedA103 = bedRepository.findAll().stream().filter(b -> b.getBedNumber().equals("A-103")).findFirst().orElse(null);
            Bed bedICU03 = bedRepository.findAll().stream().filter(b -> b.getBedNumber().equals("ICU-03")).findFirst().orElse(null);

            if (cardiology != null && drSmith != null && bedA101 != null) {
                patientRepository.save(Patient.builder()
                        .fullName("John Doe").age(45).condition(PatientCondition.NORMAL)
                        .status(PatientStatus.UNDER_TREATMENT).priorityLevel(PriorityLevel.MEDIUM)
                        .admissionDate(LocalDateTime.now().minusDays(3)).bed(bedA101)
                        .department(cardiology).assignedDoctor(drSmith).build());
            }
            if (neurology != null && drWilliams != null && bedICU01 != null) {
                patientRepository.save(Patient.builder()
                        .fullName("Jane Smith").age(32).condition(PatientCondition.CRITICAL)
                        .status(PatientStatus.UNDER_TREATMENT).priorityLevel(PriorityLevel.HIGH)
                        .admissionDate(LocalDateTime.now().minusDays(1)).bed(bedICU01)
                        .department(neurology).assignedDoctor(drWilliams).build());
            }
            if (pediatrics != null && drSmith != null && bedB202 != null) {
                patientRepository.save(Patient.builder()
                        .fullName("Robert Brown").age(67).condition(PatientCondition.SERIOUS)
                        .status(PatientStatus.UNDER_TREATMENT).priorityLevel(PriorityLevel.HIGH)
                        .admissionDate(LocalDateTime.now().minusDays(5)).bed(bedB202)
                        .department(pediatrics).assignedDoctor(drSmith).build());
            }
            if (cardiology != null && drSmith != null && bedA103 != null) {
                patientRepository.save(Patient.builder()
                        .fullName("Emily Davis").age(28).condition(PatientCondition.NORMAL)
                        .status(PatientStatus.ADMITTED).priorityLevel(PriorityLevel.LOW)
                        .admissionDate(LocalDateTime.now().minusDays(2)).bed(bedA103)
                        .department(cardiology).assignedDoctor(drSmith).build());
            }
            if (emergency != null && drWilliams != null && bedICU03 != null) {
                patientRepository.save(Patient.builder()
                        .fullName("Michael Wilson").age(54).condition(PatientCondition.CRITICAL)
                        .status(PatientStatus.UNDER_TREATMENT).priorityLevel(PriorityLevel.HIGH)
                        .admissionDate(LocalDateTime.now().minusDays(1)).bed(bedICU03)
                        .department(emergency).assignedDoctor(drWilliams).build());
            }
            if (orthopedics != null && drWilliams != null) {
                patientRepository.save(Patient.builder()
                        .fullName("Sarah Johnson").age(41).condition(PatientCondition.SERIOUS)
                        .status(PatientStatus.ADMITTED).priorityLevel(PriorityLevel.MEDIUM)
                        .admissionDate(LocalDateTime.now())
                        .department(orthopedics).assignedDoctor(drWilliams).build());
            }
            System.out.println("✅ Patients seeded.");
        }

        // --- 6. Equipment ---
        if (equipmentRepository.count() == 0) {
            Department neurology = departmentRepository.findAll().stream().filter(d -> d.getCode().equals("DEP-NEURO")).findFirst().orElse(null);
            Department cardiology = departmentRepository.findAll().stream().filter(d -> d.getCode().equals("DEP-CARD")).findFirst().orElse(null);
            Department emergency = departmentRepository.findAll().stream().filter(d -> d.getCode().equals("DEP-ER")).findFirst().orElse(null);

            Room icuSuite = roomRepository.findAll().stream().filter(r -> r.getName().equals("ICU Suite 1")).findFirst().orElse(null);
            Room room101 = roomRepository.findAll().stream().filter(r -> r.getName().equals("Room 101")).findFirst().orElse(null);
            Room erBay = roomRepository.findAll().stream().filter(r -> r.getName().equals("ER Bay 1")).findFirst().orElse(null);

            if (neurology != null && icuSuite != null) {
                equipmentRepository.save(Equipment.builder().name("Ventilator V-100").type("Ventilator").status(EquipmentStatus.IN_USE).department(neurology).room(icuSuite).build());
                equipmentRepository.save(Equipment.builder().name("Infusion Pump IP-30").type("Pump").status(EquipmentStatus.IN_USE).department(neurology).room(icuSuite).build());
                equipmentRepository.save(Equipment.builder().name("Ventilator V-101").type("Ventilator").status(EquipmentStatus.AVAILABLE).department(neurology).room(icuSuite).build());
            }
            if (cardiology != null && room101 != null) {
                equipmentRepository.save(Equipment.builder().name("Monitor M-200").type("Monitor").status(EquipmentStatus.AVAILABLE).department(cardiology).room(room101).build());
            }
            if (emergency != null && erBay != null) {
                equipmentRepository.save(Equipment.builder().name("Defibrillator D-50").type("Defibrillator").status(EquipmentStatus.AVAILABLE).department(emergency).room(erBay).build());
                equipmentRepository.save(Equipment.builder().name("X-Ray XR-01").type("Imaging").status(EquipmentStatus.AVAILABLE).department(emergency).room(erBay).build());
            }
            System.out.println("✅ Equipment seeded.");
        }

        // --- 7. System Settings ---
        if (settingsRepository.count() == 0) {
            settingsRepository.save(SystemSettings.builder()
                    .maxUsers(100).maxBeds(500).allowOverbooking(false).alertThreshold(85).build());
            System.out.println("✅ System settings seeded.");
        }

        System.out.println("✅ Seeding process completed.");
    }
}
