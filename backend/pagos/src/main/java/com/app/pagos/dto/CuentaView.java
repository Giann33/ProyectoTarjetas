package com.app.pagos.dto;

import java.math.BigDecimal;

public interface CuentaView {
    Integer getIdCuenta();
    Integer getIdPersona();
    String getNumeroCuenta();
    String getTipo();
    String getEstado();
    BigDecimal getSaldo();
}
