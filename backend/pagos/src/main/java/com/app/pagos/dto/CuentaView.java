package com.app.pagos.dto;

import java.math.BigDecimal;

public interface CuentaView {
    String getNumeroCuenta();

    Integer getIdCliente();

    Integer getIdTipoCuenta();

    String getEstado();

    BigDecimal getSaldo();

    Integer getIdTipoMoneda();
}
