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

    v.idTarjeta = t.getIdTarjeta();
    v.numeroTarjeta = t.getNumeroTarjeta();
    v.fechaExpiracion = t.getFechaExpiracion();

    // Estos campos ya existen directamente en la entidad como Integer
    v.idEmisor = t.getIdEmisor();
    v.idTipoTarjeta = t.getIdTipoTarjeta();

    // idCuenta NO está en Tarjeta, está en la relación Cuenta
    if (t.getCuenta() != null) {
        v.idCuenta = t.getCuenta().getIdCuenta();   // <-- aquí usamos getCuenta().getIdCuenta()
    }

    // Activo es Integer, no boolean; usamos getActivo()
    Integer activo = t.getActivo(); // puede ser null
    v.activo = (activo != null) ? activo : 0;       // si viene null, lo dejamos en 0

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