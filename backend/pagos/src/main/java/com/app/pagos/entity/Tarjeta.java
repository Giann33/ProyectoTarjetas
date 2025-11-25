package com.app.pagos.entity;

import java.sql.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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

    @Column(name = "Fecha_Expiracion")
    private Date fechaExpiracion;

    @Column(name = "Activo")
    private Boolean activo;

    // ESTO ES LO IMPORTANTE: CONECTA CON TU ARCHIVO CUENTA.JAVA
    @ManyToOne
    @JoinColumn(name = "Cuenta_idCuenta") // Este nombre debe ser igual a la columna en tu BD MySQL
    private Cuenta cuenta;

    // --- Otros campos como idTipoTarjeta si los usas ---

    // Getters y Setters
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

    public Cuenta getCuenta() {
        return cuenta;
    }

    public void setCuenta(Cuenta cuenta) {
        this.cuenta = cuenta;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}