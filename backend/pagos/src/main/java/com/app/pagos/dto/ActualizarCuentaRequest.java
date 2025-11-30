package com.app.pagos.dto;

import java.math.BigDecimal;

public record ActualizarCuentaRequest(
        String numeroCuentaNuevo,
        Integer idTipoCuenta,
        Integer idTipoMoneda,
        Integer sucursal,
        Integer idUsuario,  // opcional: solo lo usas si el admin puede cambiarlo
        BigDecimal saldo
) { }