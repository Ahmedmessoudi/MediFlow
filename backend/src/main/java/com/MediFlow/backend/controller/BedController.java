package com.MediFlow.backend.controller;

import com.MediFlow.backend.entity.Bed;
import com.MediFlow.backend.service.BedService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beds")
public class BedController {

    private final BedService bedService;

    public BedController(BedService bedService) {
        this.bedService = bedService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','RECEPTIONIST')")
    public ResponseEntity<List<Bed>> getAll() {
        return ResponseEntity.ok(bedService.findAll());
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','RECEPTIONIST')")
    public ResponseEntity<List<Bed>> getAvailable() {
        return ResponseEntity.ok(bedService.findAvailable());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','RECEPTIONIST')")
    public ResponseEntity<Bed> getById(@PathVariable Long id) {
        return ResponseEntity.ok(bedService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Bed> create(@RequestBody Bed bed) {
        return ResponseEntity.ok(bedService.create(bed));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Bed> update(@PathVariable Long id, @RequestBody Bed bed) {
        return ResponseEntity.ok(bedService.update(id, bed));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bedService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
