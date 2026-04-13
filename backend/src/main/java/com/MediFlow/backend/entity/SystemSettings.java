package com.MediFlow.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "system_settings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SystemSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @Builder.Default
    private Integer maxUsers = 100;

    @Column(nullable = false)
    @Builder.Default
    private Integer maxBeds = 500;

    @Column(nullable = false)
    @Builder.Default
    private Boolean allowOverbooking = false;

    @Column(nullable = false)
    @Builder.Default
    private Integer alertThreshold = 85;
}
