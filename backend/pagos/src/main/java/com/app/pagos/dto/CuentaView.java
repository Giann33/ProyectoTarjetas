package com.app.pagos.dto;

import java.math.BigDecimal;

public interface CuentaView {
    //Integer idCuenta();      // alias: idCuenta
    String getNumeroCuenta();   // alias: numeroCuenta
    Integer getIdCliente();     // alias: idCliente
    Integer getIdTipoCuenta();  // alias: idTipoCuenta
    Object getEstado();         // alias: estado (Object para evitar líos de tipo)
    BigDecimal getSaldo();      // alias: saldo (DECIMAL -> BigDecimal)
    Integer getIdTipoMoneda();  // alias: idTipoMoneda
    Integer getSucursal();       // alias: sucursal
}