package com.app.pagos.entity;


import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "catalogo_rol_usuario", schema = "sistemapagotarjeta")
public class Rol implements Serializable {


    @Id
    @Column(name = "idRol") // ajustar al nombre real de la columna en la BD
    private Integer idRol;

    @Column(name = "Descripcion", nullable = false)
    private String descripcion;

    @Column(name = "Activo", nullable = false)
    private boolean activo;

    // Getters/Setters
    public Integer getIdRol() { return idRol; }
    public void setIdRol(Integer idRol) { this.idRol = idRol; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
}