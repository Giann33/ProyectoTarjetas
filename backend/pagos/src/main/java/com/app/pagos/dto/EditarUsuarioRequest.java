package com.app.pagos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EditarUsuarioRequest {

    private Integer idUsuario;    // por si lo usas en el body
    private Integer personaId;

    private String nombre;
    private String apellido;
    private String correo;
    private Integer idGenero;

    // Rol solo si el que edita es admin
    private Integer idRol;

    // ⚠️ ESTA es la contraseña opcional
    // IMPORTANTE: SIN @NotBlank, @NotNull, etc.
    private String contrasena;


    
    // ===== GETTERS =====
    public Integer getIdUsuario() {
        return idUsuario;
    }
    public Integer getPersonaId() {
        return personaId;
    }
    public String getNombre() {
        return nombre;
    }
    public String getApellido() {
        return apellido;
    }
    public String getCorreo() {
        return correo;
    }
    public Integer getIdGenero() {
        return idGenero;
    }
    public Integer getIdRol() {
        return idRol;
    }
    public String getContrasena() {
        return contrasena;
    }

    // ===== SETTERS =====
    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }
    public void setPersonaId(Integer personaId) {
        this.personaId = personaId;
    }
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    public void setApellido(String apellido) {
        this.apellido = apellido;
    }
    public void setCorreo(String correo) {
        this.correo = correo;
    }
    public void setIdGenero(Integer idGenero) {
        this.idGenero = idGenero;
    }
    public void setIdRol(Integer idRol) {
        this.idRol = idRol;
    }
    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }
    // getters y setters...
}

