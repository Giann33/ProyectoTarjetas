package com.app.pagos.dto;

import java.math.BigDecimal;

public class TransaccionRequest {
    private Integer idTarjeta; // ¿Qué tarjeta paga?
    private BigDecimal monto; // ¿Cuánto paga? (SIEMPRE usa BigDecimal para dinero)
    private String detalle; // Concepto (ej: "Pago Luz")
    private Integer idTipoTransaccion; // 1=Compra, 2=Transferencia, etc.

    // Getters y Setters obligatorios
    public Integer getIdTarjeta() {
        return idTarjeta;
    }

    public void setIdTarjeta(Integer idTarjeta) {
        this.idTarjeta = idTarjeta;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public String getDetalle() {
        return detalle;
    }

    public void setDetalle(String detalle) {
        this.detalle = detalle;
    }

    public Integer getIdTipoTransaccion() {
        return idTipoTransaccion;
    }

    public void setIdTipoTransaccion(Integer idTipoTransaccion) {
        this.idTipoTransaccion = idTipoTransaccion;
    }
}