package com.MediFlow.backend.controller;

import com.MediFlow.backend.entity.Ward;
import com.MediFlow.backend.service.WardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wards")
public class WardController {

    private final WardService wardService;

    public WardController(WardService wardService) {
        this.wardService = wardService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<List<Ward>> getAll() {
        return ResponseEntity.ok(wardService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<Ward> getById(@PathVariable Long id) {
        return ResponseEntity.ok(wardService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ward> create(@RequestBody Ward ward) {
        return ResponseEntity.ok(wardService.create(ward));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ward> update(@PathVariable Long id, @RequestBody Ward ward) {
        return ResponseEntity.ok(wardService.update(id, ward));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        wardService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
