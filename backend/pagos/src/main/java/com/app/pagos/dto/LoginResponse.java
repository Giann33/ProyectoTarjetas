package com.app.pagos.dto;

public record LoginResponse(
    Integer idPersona,
    String nombre,
    String correo,
    Integer rol // por ahora int
) {}