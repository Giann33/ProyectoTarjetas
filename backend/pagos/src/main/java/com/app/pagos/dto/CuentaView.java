package com.app.pagos.dto;

import java.math.BigDecimal;

public interface CuentaView {
    Integer getIdCuenta();
    Integer getIdUsuario();
    String getNumeroCuenta();
    String getTipo();  //Cambiar?
   // String getEstado();
    BigDecimal getSaldo();
}
