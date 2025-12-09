package com.app.pagos.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Persona")
public class Persona {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idPersona")
    private Integer idPersona;

    @Column(name = "Nombre")
    private String Nombre;

    @Column(name = "Apellido")
    private String Apellido;

    @Column(name = "Correo")
    private String correo;

    @Column(name = "Contrasenna")
    private String contrasenna;

    @Column(name = "Rol")
    private Integer rol;

    @Column(name = "Activo")
    private Boolean activo;

    @Column(name = "Fecha_Creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "Fecha_Modificacion")
    private LocalDateTime fechaModificacion;

    @JoinColumn
    @Column(name = "catalogo_genero_idGenero")
    private Integer idGenero;

}