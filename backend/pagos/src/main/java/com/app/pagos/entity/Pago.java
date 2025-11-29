package com.app.pagos.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "pago")
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idPago")
    private Integer idPago;

    @Column(name = "Monto")
    private BigDecimal monto;

      // ===============================
    //     RELACIÓN: METODO DE PAGO
    // ===============================
    @ManyToOne
    @JoinColumn(name = "Metodo", referencedColumnName = "idMetodoPago", nullable = false)
    private MetodoPago metodo;

    // ===============================
    //     RELACIÓN: TIPO DE MONEDA
    // ===============================
    @ManyToOne
    @JoinColumn(name = "catalogo_tipo_moneda_idTipoMoneda", referencedColumnName = "idTipoMoneda", nullable = false)
    private TipoMoneda tipoMoneda;

    @OneToOne
    @JoinColumn(name = "Transaccion_idTransaccion")
    private Transaccion transaccion;

    // Getters y Setters
    public Integer getIdPago() {
        return idPago;
    }

    public void setIdPago(Integer idPago) {
        this.idPago = idPago;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public MetodoPago getMetodo() {
        return metodo;
    }
    public void setMetodo(MetodoPago metodo) {
        this.metodo = metodo;
    }
    public TipoMoneda getTipoMoneda() {
        return tipoMoneda;
    }
    public void setTipoMoneda(TipoMoneda tipoMoneda) {
        this.tipoMoneda = tipoMoneda;
    }

    public Transaccion getTransaccion() {
        return transaccion;
    }

    public void setTransaccion(Transaccion transaccion) {
        this.transaccion = transaccion;
    }
}