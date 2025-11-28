package com.app.pagos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tarjeta")
public class Tarjeta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idTarjeta")
    private Integer idTarjeta;

    @Column(name = "Numero_Tarjeta")
    private String numeroTarjeta;

    // Lo cambiamos a String para guardar "12/28" sin problemas de conversión
    @Column(name = "Fecha_Expiracion")
    private String fechaExpiracion;

    @Column(name = "CVV")
    private String cvv;

    @Column(name = "PIN")
    private String pin;

    @Column(name = "Activo")
    private Integer activo; // Usamos Integer (1 o 0) para mayor compatibilidad con MySQL

    // --- RELACIONES (Usamos IDs directos para evitar errores complejos) ---

    @Column(name = "Cuenta_idCuenta")
    private Integer idCuenta; // En vez del objeto Cuenta, guardamos su ID

    @Column(name = "idTipoTarjeta")
    private Integer idTipoTarjeta;

    @Column(name = "idEmisor")
    private Integer idEmisor;

    // ==========================================
    // GETTERS Y SETTERS (Necesarios sin Lombok)
    // ==========================================

    public Integer getIdTarjeta() {
        return idTarjeta;
    }

    public void setIdTarjeta(Integer idTarjeta) {
        this.idTarjeta = idTarjeta;
    }

    public String getNumeroTarjeta() {
        return numeroTarjeta;
    }

    public void setNumeroTarjeta(String numeroTarjeta) {
        this.numeroTarjeta = numeroTarjeta;
    }

    public String getFechaExpiracion() {
        return fechaExpiracion;
    }

    public void setFechaExpiracion(String fechaExpiracion) {
        this.fechaExpiracion = fechaExpiracion;
    }

    public String getCvv() {
        return cvv;
    }

    public void setCvv(String cvv) {
        this.cvv = cvv;
    }

    public String getPin() {
        return pin;
    }

    public void setPin(String pin) {
        this.pin = pin;
    }

    public Integer getActivo() {
        return activo;
    }

    public void setActivo(Integer activo) {
        this.activo = activo;
    }

    public Integer getIdCuenta() {
        return idCuenta;
    }

    public void setIdCuenta(Integer idCuenta) {
        this.idCuenta = idCuenta;
    }

    public Integer getIdTipoTarjeta() {
        return idTipoTarjeta;
    }

    public void setIdTipoTarjeta(Integer idTipoTarjeta) {
        this.idTipoTarjeta = idTipoTarjeta;
    }

    public Integer getIdEmisor() {
        return idEmisor;
    }

    public void setIdEmisor(Integer idEmisor) {
        this.idEmisor = idEmisor;
    }
}