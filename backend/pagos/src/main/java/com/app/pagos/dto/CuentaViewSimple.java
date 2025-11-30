package com.app.pagos.dto;

import java.math.BigDecimal;

import com.app.pagos.entity.Cuenta;

public class CuentaViewSimple {

    private Integer idCuenta;
    private String numeroCuenta;

    public Integer getIdCuenta() {
        return idCuenta;
    }

    public void setIdCuenta(Integer idCuenta) {
        this.idCuenta = idCuenta;
    }

    public String getNumeroCuenta() {
        return numeroCuenta;
    }

    public void setNumeroCuenta(String numeroCuenta) {
        this.numeroCuenta = numeroCuenta;
    }

    public static CuentaViewSimple from(Cuenta cuenta) {
        CuentaViewSimple v = new CuentaViewSimple();
        v.setIdCuenta(cuenta.getIdCuenta());
        v.setNumeroCuenta(cuenta.getNumeroCuenta());
        return v;
    }
}