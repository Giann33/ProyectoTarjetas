package com.app.pagos.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "comercio")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Comercio {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 150)
  private String nombre;

  @Column(nullable = false, length = 30)
  private String estado = "ACTIVO";

  private Instant creadoEn = Instant.now();
  private Instant actualizadoEn;
  private Instant eliminadoEn;
}