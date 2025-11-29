package com.app.pagos.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bitacora")
public class Bitacora {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idBitacora")
    private Integer idBitacora;

    @Column(name = "Modulo", nullable = false, length = 100)
    private String modulo;

    @Column(name = "Accion", nullable = false, columnDefinition = "TEXT")
    private String accion;

    @Column(name = "Fecha", nullable = false)
    private LocalDateTime fecha;

    @ManyToOne
    @JoinColumn(name = "reporte_transaccion_idReporte", nullable = false)
    private ReporteTransaccion reporteTransaccion;

    @ManyToOne
    @JoinColumn(name = "Usuario_idCliente", nullable = false)
    private Usuario usuario;

    public Integer getIdBitacora() {
        return idBitacora;
    }

    public void setIdBitacora(Integer idBitacora) {
        this.idBitacora = idBitacora;
    }

    public String getModulo() {
        return modulo;
    }

    public void setModulo(String modulo) {
        this.modulo = modulo;
    }

    public String getAccion() {
        return accion;
    }

    public void setAccion(String accion) {
        this.accion = accion;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public ReporteTransaccion getReporteTransaccion() {
        return reporteTransaccion;
    }

    public void setReporteTransaccion(ReporteTransaccion reporteTransaccion) {
        this.reporteTransaccion = reporteTransaccion;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}