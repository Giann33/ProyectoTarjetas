package com.app.pagos.dto;

public record ActualizarCuentaRequest(
        String numeroCuentaNuevo,
        Integer idTipoCuenta,
        Integer idTipoMoneda,
        Integer sucursal,
        Integer idUsuario   // opcional: solo lo usas si el admin puede cambiarlo
) { }