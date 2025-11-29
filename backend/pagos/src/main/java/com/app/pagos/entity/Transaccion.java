package com.app.pagos.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "transaccion")
public class Transaccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idTransaccion")
    private Integer idTransaccion;

    @Column(name = "Fecha")
    private LocalDateTime fecha;

@ManyToOne(optional = false)
@JoinColumn(name = "Estado", nullable = false)
private EstadoTransaccion estado;

    @Column(name = "Tipo")
    private Integer tipo;

    @Column(name = "Destino")
    private String Destino;

    @Column(name = "Detalle")
    private String Detalle;

    @ManyToOne
    @JoinColumn(name = "idTarjeta")
    private Tarjeta tarjeta;

    @ManyToOne
    @JoinColumn(name = "servicio_idServicio")
    private Servicio servicio;

    // Getters y Setters
    public Integer getIdTransaccion() {
        return idTransaccion;
    }

    public void setIdTransaccion(Integer idTransaccion) {
        this.idTransaccion = idTransaccion;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

   public EstadoTransaccion getEstado() {
    return estado;
}

public void setEstado(EstadoTransaccion estado) {
    this.estado = estado;
}

    public Integer getTipo() {
        return tipo;
    }

    public void setTipo(Integer tipo) {
        this.tipo = tipo;
    }

    public Tarjeta getTarjeta() {
        return tarjeta;
    }

    public void setTarjeta(Tarjeta tarjeta) {
        this.tarjeta = tarjeta;
    }

    public Servicio getServicio() {
        return servicio;
    }

    public void setServicio(Servicio servicio) {
        this.servicio = servicio;
    }
    public String getDestino() {
        return Destino;
    }
    public void setDestino(String destino) {
        Destino = destino;
    }
    public String getDetalle() {
        return Detalle;
    }
    public void setDetalle(String detalle) {
        Detalle = detalle;
    }
}