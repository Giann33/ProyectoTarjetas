package com.app.pagos.dto;

import com.app.pagos.entity.Tarjeta;

public class TarjetaViewConsulta {

    private Integer idTarjeta;
    private String numeroTarjeta;
    private String fechaExpiracion;
    private Integer idEmisor;
    private Integer idTipoTarjeta;
    private Integer idCuenta;
    private Integer activo;

    public static TarjetaViewConsulta from(Tarjeta t) {
    TarjetaViewConsulta v = new TarjetaViewConsulta();

    v.setIdTarjeta(t.getIdTarjeta());
    v.setNumeroTarjeta(t.getNumeroTarjeta());
    v.setFechaExpiracion(t.getFechaExpiracion());
    v.setIdEmisor(t.getIdEmisor());
    v.setIdTipoTarjeta(t.getIdTipoTarjeta());
    v.setActivo(t.getActivo());

    // Solo necesitamos el ID de la cuenta, no toda la cuenta
    if (t.getCuenta() != null) {
        v.setIdCuenta(t.getCuenta().getIdCuenta());
    }

    return v;
}

    // getters y setters
    // ==== getters y setters ====
    public Integer getIdTarjeta() { return idTarjeta; }
    public void setIdTarjeta(Integer idTarjeta) { this.idTarjeta = idTarjeta; }

    public String getNumeroTarjeta() { return numeroTarjeta; }
    public void setNumeroTarjeta(String numeroTarjeta) { this.numeroTarjeta = numeroTarjeta; }

    public String getFechaExpiracion() { return fechaExpiracion; }
    public void setFechaExpiracion(String fechaExpiracion) { this.fechaExpiracion = fechaExpiracion; }

    public Integer getIdEmisor() { return idEmisor; }
    public void setIdEmisor(Integer idEmisor) { this.idEmisor = idEmisor; }

    public Integer getIdTipoTarjeta() { return idTipoTarjeta; }
    public void setIdTipoTarjeta(Integer idTipoTarjeta) { this.idTipoTarjeta = idTipoTarjeta; }

    public Integer getIdCuenta() { return idCuenta; }
    public void setIdCuenta(Integer idCuenta) { this.idCuenta = idCuenta; }

    public Integer getActivo() { return activo; }
    public void setActivo(Integer activo) { this.activo = activo; }
}