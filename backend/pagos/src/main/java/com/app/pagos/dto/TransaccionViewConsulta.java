package com.app.pagos.dto;

import com.app.pagos.entity.Pago;
import com.app.pagos.entity.Transaccion;

public class TransaccionViewConsulta {

    private Integer idTransaccion;
    private String fecha;
    private String numeroTarjeta;
    private String monto;
    private String destino;
    private String estado; // Estado de la transacción (Aprobada/Rechazada)

    // --- NUEVO CAMPO PARA EL REPORTE DE REVERSOS ---
    private String estadoReverso; // "Pendiente" o "Completado"

    // Método estático para convertir de Entidad a DTO
    public static TransaccionViewConsulta from(Transaccion t, Pago p) {
        TransaccionViewConsulta v = new TransaccionViewConsulta();

        v.setIdTransaccion(t.getIdTransaccion());
        v.setFecha(t.getFecha() != null ? t.getFecha().toString() : "");

        if (t.getTarjeta() != null) {
            v.setNumeroTarjeta(t.getTarjeta().getNumeroTarjeta());
        }

        // Sacamos el monto del Pago (si existe), si no, ponemos 0
        if (p != null && p.getMonto() != null) {
            v.setMonto(p.getMonto().toString());
        } else {
            v.setMonto("0.00");
        }

        v.setDestino(t.getDestino());
        v.setEstado(t.getEstado() != null ? t.getEstado().getDescripcion() : "");

        // Por defecto lo ponemos Pendiente (el Controller decidirá si cambiarlo)
        v.setEstadoReverso("Pendiente");

        return v;
    }

    // --- GETTERS Y SETTERS ---
    public Integer getIdTransaccion() {
        return idTransaccion;
    }

    public void setIdTransaccion(Integer idTransaccion) {
        this.idTransaccion = idTransaccion;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public String getNumeroTarjeta() {
        return numeroTarjeta;
    }

    public void setNumeroTarjeta(String numeroTarjeta) {
        this.numeroTarjeta = numeroTarjeta;
    }

    public String getMonto() {
        return monto;
    }

    public void setMonto(String monto) {
        this.monto = monto;
    }

    public String getDestino() {
        return destino;
    }

    public void setDestino(String destino) {
        this.destino = destino;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getEstadoReverso() {
        return estadoReverso;
    }

    public void setEstadoReverso(String estadoReverso) {
        this.estadoReverso = estadoReverso;
    }
}