package com.app.pagos.dto;

import com.app.pagos.entity.Bitacora;

public class BitacoraViewConsulta {

    private Integer idBitacora;
    private String fecha;
    private String modulo;
    private String accion;
    private Integer idReporte;
    private Integer idUsuario;

    public static BitacoraViewConsulta from(Bitacora b) {
        BitacoraViewConsulta v = new BitacoraViewConsulta();

        v.idBitacora = b.getIdBitacora();                    // PK
        v.fecha = (b.getFecha() != null)                     // DATETIME
                ? b.getFecha().toString()
                : "";

        v.modulo = b.getModulo();                            // VARCHAR(100)
        v.accion = b.getAccion();                            // TEXT

        // FK a reporte_transaccion
        if (b.getReporteTransaccion() != null) {
            v.idReporte = b.getReporteTransaccion().getIdReporte();
        }

        // FK a Usuario
        if (b.getUsuario() != null) {
            v.idUsuario = b.getUsuario().getIdUsuario();
        }

        return v;
    }

    // Getters y setters

    public Integer getIdBitacora() { return idBitacora; }
    public void setIdBitacora(Integer idBitacora) { this.idBitacora = idBitacora; }

    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }

    public String getModulo() { return modulo; }
    public void setModulo(String modulo) { this.modulo = modulo; }

    public String getAccion() { return accion; }
    public void setAccion(String accion) { this.accion = accion; }

    public Integer getIdReporte() { return idReporte; }
    public void setIdReporte(Integer idReporte) { this.idReporte = idReporte; }

    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }
}
