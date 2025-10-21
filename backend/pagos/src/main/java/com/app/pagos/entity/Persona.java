package com.app.pagos.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Persona", schema = "sistemapagotarjeta")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Persona {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer idPersona;

  @Column(nullable=false, length=100)
  private String Nombre;

  @Column(nullable=false, unique=true, length=100)
  private String Correo;

  @Column(nullable=false, length=255)
  private String Contrasenna; // guardaremos BCrypt aquí

  @Column(nullable=false)
  private Integer Rol; // si no quieres usar la tabla Usuario aún

  @Column(nullable=false)
  private Boolean Activo;

  private LocalDateTime Fecha_Creacion;
  private LocalDateTime Fecha_Modificacion;

  @Column(name="catalogo_genero_idGenero", nullable=false)
  private Integer idGenero;
}