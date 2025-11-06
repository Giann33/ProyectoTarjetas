package com.app.pagos.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

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