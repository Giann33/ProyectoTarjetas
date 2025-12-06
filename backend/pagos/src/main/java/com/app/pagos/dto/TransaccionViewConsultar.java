package com.app.pagos.dto;

import java.math.BigDecimal;

import com.app.pagos.entity.Pago;
import com.app.pagos.entity.Transaccion;

public class TransaccionViewConsultar {

    private Integer idTransaccion;
    private String fecha;
    private String estado;
    private String tipo;          // ← ahora es la DESCRIPCIÓN, no el número
    private String tarjeta;       // ← últimos 4 dígitos
    private String servicio;
    private String destino;
    private String detalle;
    private String metodoPago;    // ← descripción del método
    private BigDecimal monto;
    private String tipoMoneda;    // ← símbolo o nombre

    public static TransaccionViewConsultar from(Transaccion t, Pago p) {
        TransaccionViewConsultar v = new TransaccionViewConsultar();

        v.idTransaccion = t.getIdTransaccion();
        v.fecha = (t.getFecha() != null) ? t.getFecha().toString() : "";
        v.estado = (t.getEstado() != null) ? t.getEstado().getDescripcion() : "";

        // ===========================
        //  TIPO (mapear número → texto)
        // ===========================
        v.tipo = mapearTipo(t.getTipo());

        // ===========================
        //  TARJETA (últimos 4 dígitos)
        // ===========================
        if (t.getTarjeta() != null && t.getTarjeta().getNumeroTarjeta() != null) {
            String num = t.getTarjeta().getNumeroTarjeta(); // 🔴 ajusta el getter si se llama distinto
            if (num.length() > 4) {
                v.tarjeta = "**** " + num.substring(num.length() - 4);
            } else {
                v.tarjeta = num;
            }
        } else {
            v.tarjeta = "";
        }

        // ===========================
        //  SERVICIO / DESTINO / DETALLE
        // ===========================
        v.servicio = (t.getServicio() != null) ? t.getServicio().getDescripcion() : "";
        v.destino = t.getDestino();
        v.detalle = t.getDetalle();

        // ===========================
        //  PAGO: MÉTODO, MONTO, MONEDA
        // ===========================
        if (p != null) {
            v.metodoPago = (p.getMetodo() != null) ? p.getMetodo().getDescripcion() : "";
            v.monto = p.getMonto();
            v.tipoMoneda = (p.getTipoMoneda() != null) ? p.getTipoMoneda().getDescripcion() : "";
            // si prefieres el símbolo, usa getSimbolo()
            // v.tipoMoneda = p.getTipoMoneda().getSimbolo();
        } else {
            v.metodoPago = "";
            v.monto = null;
            v.tipoMoneda = "";
        }

        return v;
    }

    // ===========================
    //  MAPEO DE TIPO DE TRANSACCIÓN
    //   (según tus IDs de catálogo)
    // ===========================
    private static String mapearTipo(Integer idTipo) {
        if (idTipo == null) return "";

        switch (idTipo) {
            case 1:
                return "Comercial";
            case 2:
                return "Financiero";
            // agrega más casos si luego tienes otros tipos
            default:
                return "Desconocido";
        }
    }

    // Getters & Setters

    public Integer getIdTransaccion() { return idTransaccion; }
    public void setIdTransaccion(Integer idTransaccion) { this.idTransaccion = idTransaccion; }

    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getTarjeta() { return tarjeta; }
    public void setTarjeta(String tarjeta) { this.tarjeta = tarjeta; }

    public String getServicio() { return servicio; }
    public void setServicio(String servicio) { this.servicio = servicio; }

    public String getDestino() { return destino; }
    public void setDestino(String destino) { this.destino = destino; }

    public String getDetalle() { return detalle; }
    public void setDetalle(String detalle) { this.detalle = detalle; }

    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }

    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }

    public String getTipoMoneda() { return tipoMoneda; }
    public void setTipoMoneda(String tipoMoneda) { this.tipoMoneda = tipoMoneda; }
}