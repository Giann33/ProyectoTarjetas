package com.app.pagos.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "cuenta") // o "cuentas" si así se llama en tu BD
public class Cuenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idCuenta")
    private Integer idCuenta;

    @Column(name = "NumeroCuenta")
    private String numeroCuenta;

    @Column(name = "Usuario_idUsuario")
    private Integer Usuario;

    @Column(name = "catalogo_tipo_cuenta_idTipoCuenta")
    private Integer catalogo_tipo_cuenta_idTipoCuenta;
    /*
     * @Column(name = "estado")
     * private String estado;
     */
    @Column(name = "saldo")
    private BigDecimal saldo;

    @Column(name = "Sucursal_idSucursal")
    private int sucursal;

    @Column(name = "catalogo_tipo_moneda_idTipoMoneda")
    private Integer catalogo_tipo_moneda_idTipoMoneda;

    // Getters y Setters

    public Integer getIdCuenta() {
        return idCuenta;
    }

    public void setIdCuenta(Integer idCuenta) {
        this.idCuenta = idCuenta;
    }

    public Integer getSucursal() {
        return sucursal;
    }

    public void setSucursal(Integer sucursal) {
        this.sucursal = sucursal;
    }

    public String getNumeroCuenta() {
        return numeroCuenta;
    }

    public void setNumeroCuenta(String numeroCuenta) {
        this.numeroCuenta = numeroCuenta;
    }

    public Integer getUsuario() {
        return Usuario;
    }

    public void setUsuario(Integer usuario) {
        this.Usuario = usuario;
    }

    public Integer getCatalogo_tipo_cuenta_idTipoCuenta() {
        return catalogo_tipo_cuenta_idTipoCuenta;
    }

    public void setCatalogo_tipo_cuenta_idTipoCuenta(Integer catalogo_tipo_cuenta_idTipoCuenta) {
        this.catalogo_tipo_cuenta_idTipoCuenta = catalogo_tipo_cuenta_idTipoCuenta;
    }
    /*
     * public String getEstado() {
     * return estado;
     * }
     * 
     * public void setEstado(String estado) {
     * this.estado = estado;
     * }
     */

    public BigDecimal getSaldo() {
        return saldo;
    }

    public void setSaldo(BigDecimal saldo) {
        this.saldo = saldo;
    }

    public Integer getCatalogo_tipo_moneda_idTipoMoneda() {
        return catalogo_tipo_moneda_idTipoMoneda;
    }

    public void setCatalogo_tipo_moneda_idTipoMoneda(Integer catalogo_tipo_moneda_idTipoMoneda) {
        this.catalogo_tipo_moneda_idTipoMoneda = catalogo_tipo_moneda_idTipoMoneda;
    }

}
