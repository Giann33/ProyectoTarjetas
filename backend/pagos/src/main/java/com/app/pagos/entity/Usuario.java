package com.app.pagos.entity;

import jakarta.persistence.*;
import java.io.Serializable;


@Entity
@Table(name = "Usuario", schema = "sistemapagotarjeta")
public class Usuario implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idUsuario")
    private Integer idUsuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "catalogo_rol_usuario_idRol", nullable = false)
    private Rol rol;

    @OneToOne
    @JoinColumn(name = "Persona_idUsuario", referencedColumnName = "idPersona")
    private Persona persona;

    @Column(name = "Activo", nullable = false)
    private boolean activo;

    // Getters/Setters
    public Integer getIdCliente() { return idUsuario; }
    public void setIdCliente(Integer idCliente) { this.idUsuario = idCliente; }

    public Rol getRol() { return rol; }
    public void setRol(Rol rol) { this.rol = rol; }

    public Persona getPersona() { return persona; }
    public void setPersona(Persona persona) { this.persona = persona; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
}