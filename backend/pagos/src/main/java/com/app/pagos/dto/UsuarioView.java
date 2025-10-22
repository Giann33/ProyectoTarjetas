package com.app.pagos.dto;

public record UsuarioView(
        int idPersona,
        String nombre,
        boolean personaActiva,
        String correo,
        String tipoCorreo
) {}
