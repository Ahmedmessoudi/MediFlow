package com.MediFlow.backend.controller;

import com.MediFlow.backend.dto.DashboardStats;
import com.MediFlow.backend.entity.User;
import com.MediFlow.backend.repository.UserRepository;
import com.MediFlow.backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    public DashboardController(DashboardService dashboardService, UserRepository userRepository) {
        this.dashboardService = dashboardService;
        this.userRepository = userRepository;
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<DashboardStats> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/doctor-stats")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DashboardStats> getDoctorStats(Authentication authentication) {
        User doctor = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(dashboardService.getDoctorStats(doctor.getId()));
    }
}
