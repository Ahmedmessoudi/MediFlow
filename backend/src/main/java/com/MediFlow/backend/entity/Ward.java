package com.MediFlow.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "wards")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @OneToMany(mappedBy = "ward", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Room> rooms;
}
