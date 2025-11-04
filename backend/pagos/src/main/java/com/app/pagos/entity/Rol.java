package com.app.pagos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "catalogo_rol_usuario", schema = "sistemapagotarjeta")
public class Rol {

    @Id
    @Column(name = "idRol") // usa el nombre exacto de tu BD
    private Integer idRol;

    @Column(name = "Descripcion", nullable = false)
    private String descripcion;

    @Column(name = "Activo", nullable = false)
    private boolean activo;

    public Integer getIdRol() {
        return idRol;
    }

    public void setIdRol(Integer idRol) {
        this.idRol = idRol;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }
}
