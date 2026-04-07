package com.MediFlow.backend.controller;

import com.MediFlow.backend.dto.PatientRequest;
import com.MediFlow.backend.entity.Patient;
import com.MediFlow.backend.enums.PatientCondition;
import com.MediFlow.backend.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','RECEPTIONIST')")
    public ResponseEntity<List<Patient>> getAll() {
        return ResponseEntity.ok(patientService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','RECEPTIONIST')")
    public ResponseEntity<Patient> getById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<Patient> create(@Valid @RequestBody PatientRequest request) {
        return ResponseEntity.ok(patientService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<Patient> update(@PathVariable Long id, @Valid @RequestBody PatientRequest request) {
        return ResponseEntity.ok(patientService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        patientService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/allocate")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<Patient> allocateBed(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.allocateBed(id));
    }

    @PostMapping("/{id}/discharge")
    @PreAuthorize("hasAnyRole('ADMIN','NURSE')")
    public ResponseEntity<Patient> discharge(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.discharge(id));
    }

    @PutMapping("/{id}/condition")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ResponseEntity<Patient> updateCondition(@PathVariable Long id, @RequestBody Map<String, String> body) {
        PatientCondition condition = PatientCondition.valueOf(body.get("condition").toUpperCase());
        return ResponseEntity.ok(patientService.updateCondition(id, condition));
    }
}
