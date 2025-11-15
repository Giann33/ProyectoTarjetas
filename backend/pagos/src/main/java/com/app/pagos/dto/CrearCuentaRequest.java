package com.app.pagos.dto;

import java.math.BigDecimal;

public record CrearCuentaRequest(
        String numeroCuenta,
        Integer idUsuario,
        Integer tipoCuenta,
        Integer tipoMoneda,
        Integer sucursal,
        BigDecimal saldo
) {
}