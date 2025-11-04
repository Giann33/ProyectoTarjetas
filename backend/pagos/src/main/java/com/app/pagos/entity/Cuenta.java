// src/main/java/com/app/pagos/entity/Cuenta.java
package com.app.pagos.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "cuenta") // agrega schema si aplica: , schema = "sistemapagotarjeta"
public class Cuenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idCuenta")
    private Integer id;

    @Column(name = "NumeroCuenta", nullable = false, unique = true, length = 255)
    private String numeroCuenta;

    @ManyToOne
    @JoinColumn(name = "Usuario_idUsuario") // debe coincidir EXACTO con la columna FK en BD
    private Usuario usuario;

    @Column(name = "catalogo_tipo_cuenta_idTipoCuenta")
    private Integer idTipoCuenta;

    @Column(name = "catalogo_tipo_moneda_idTipoMoneda")
    private Integer idTipoMoneda;

    @Column(name = "Estado") // si tu columna es "estado" cámbialo a "estado"
    private String estado;

    @Column(name = "Saldo", precision = 38, scale = 2)
    private BigDecimal saldo;

    // Getters y setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNumeroCuenta() {
        return numeroCuenta;
    }

    public void setNumeroCuenta(String numeroCuenta) {
        this.numeroCuenta = numeroCuenta;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Integer getIdTipoCuenta() {
        return idTipoCuenta;
    }

    public void setIdTipoCuenta(Integer idTipoCuenta) {
        this.idTipoCuenta = idTipoCuenta;
    }

    public Integer getIdTipoMoneda() {
        return idTipoMoneda;
    }

    public void setIdTipoMoneda(Integer idTipoMoneda) {
        this.idTipoMoneda = idTipoMoneda;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public BigDecimal getSaldo() {
        return saldo;
    }

    public void setSaldo(BigDecimal saldo) {
        this.saldo = saldo;
    }
}
