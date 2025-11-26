package com.app.pagos.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrearUsuarioRequest {

    private String nombre;
    private String apellido;     // si tu entidad Persona tiene este campo
    private String correo;
    private String contrasenna;
    private Integer idGenero;    // catalogo_genero_idGenero
    private Integer idRol;       // catalogo_rol_usuario.idRol
    private Boolean activo;      // si quieres permitirlo desde frontend
} 
    
