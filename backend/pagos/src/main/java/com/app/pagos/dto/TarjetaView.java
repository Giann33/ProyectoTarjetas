package com.app.pagos.dto;

import lombok.Data; // Si usas Lombok
// Si no usas Lombok, genera los Getters y Setters abajo

@Data
public class TarjetaView {
    private Integer idTarjeta;
    private String numeroEnmascarado;
    private String tipo;

    // Getters y Setters manuales si no usas @Data
    public Integer getIdTarjeta() {
        return idTarjeta;
    }

    public void setIdTarjeta(Integer idTarjeta) {
        this.idTarjeta = idTarjeta;
    }

    public String getNumeroEnmascarado() {
        return numeroEnmascarado;
    }

    public void setNumeroEnmascarado(String numeroEnmascarado) {
        this.numeroEnmascarado = numeroEnmascarado;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
}