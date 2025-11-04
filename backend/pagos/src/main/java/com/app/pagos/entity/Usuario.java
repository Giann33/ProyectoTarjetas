// src/main/java/com/app/pagos/entity/Usuario.java
package com.app.pagos.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "Usuario", schema = "sistemapagotarjeta")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idUsuario")
    private Integer idUsuario;

    @Column(name = "Nombre", nullable = false)
    private String nombre;

    @Column(name = "Correo", nullable = false, unique = true)
    private String correo;

    @Column(name = "Contrasenna", nullable = false)
    private String contrasenna;

    // Si tu columna es INT (no FK a tabla Rol), mantenla como Integer
    @Column(name = "Rol", nullable = false)
    private Integer rol;

    @Column(name = "Activo", nullable = false)
    private Boolean activo;

    @Column(name = "Fecha_Creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "Fecha_Modificacion")
    private LocalDateTime fechaModificacion;
}
