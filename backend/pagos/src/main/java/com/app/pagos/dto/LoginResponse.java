package com.app.pagos.dto;

public record LoginResponse(
                Integer idPersona, // aquí en realidad será el idUsuario
                String nombre,
                String correo,
                Integer rol) {
}
