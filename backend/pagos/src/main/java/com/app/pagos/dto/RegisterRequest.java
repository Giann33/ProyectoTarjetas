package com.app.pagos.dto;

// Usamos 'record' que crea automáticamente los getters (nombre(), correo(), etc.)
// Nota: Fíjate que el campo se llame 'contrasena' para coincidir con tu servicio req.contrasena()
public record RegisterRequest(
        String nombre,
        String apellidos,
        String correo,
        String contrasena,
        Integer genero,
        Integer idRol) {
}