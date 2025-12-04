package com.app.pagos.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "reverso_devolucion")
public class ReversoDevolucion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idReverso")
    private Integer idReverso;

    // Guardamos solo el ID de la transacción para simplificar
    @Column(name = "idTransaccion")
    private Integer idTransaccion;

    @Column(name = "Motivo")
    private String motivo;

    @Column(name = "Fecha_Reverso")
    private LocalDateTime fechaReverso;

    // --- GETTERS Y SETTERS ---
    public Integer getIdReverso() {
        return idReverso;
    }

    public void setIdReverso(Integer idReverso) {
        this.idReverso = idReverso;
    }

    public Integer getIdTransaccion() {
        return idTransaccion;
    }

    public void setIdTransaccion(Integer idTransaccion) {
        this.idTransaccion = idTransaccion;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public LocalDateTime getFechaReverso() {
        return fechaReverso;
    }

    public void setFechaReverso(LocalDateTime fechaReverso) {
        this.fechaReverso = fechaReverso;
    }
}