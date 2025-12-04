package com.app.pagos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "catalogo_estado_transaccion")
public class EstadoTransaccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // --- CORRECCIÓN CRÍTICA AQUÍ ---
    // Tu base de datos tiene la columna "idEstadoTransaccion", no "idEstado"
    @Column(name = "idEstadoTransaccion")
    private Integer idEstado;

    @Column(name = "Descripcion")
    private String descripcion;

    @Column(name = "Activo")
    private Integer activo;

    // Getters y Setters
    public Integer getIdEstado() {
        return idEstado;
    }

    public void setIdEstado(Integer idEstado) {
        this.idEstado = idEstado;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Integer getActivo() {
        return activo;
    }

    public void setActivo(Integer activo) {
        this.activo = activo;
    }
}