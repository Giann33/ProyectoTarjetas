package com.app.pagos.dto;

import com.app.pagos.entity.Usuario;
import com.app.pagos.entity.Persona;

public class UsuarioView {

    // === Campos expuestos (todos Integer) ===
    private Integer idUsuario;
    private boolean activo;
    private Integer rolId;
    private Integer personaId;
    private String nombre;
    private String correo;
    private Integer idGenero;
    private String apellido;

    public UsuarioView() {
    }

    // --- getters/setters (todos en Integer) ---
    public Integer getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public Integer getRolId() {
        return rolId;
    }

    public void setRolId(Integer rolId) {
        this.rolId = rolId;
    }

    public Integer getPersonaId() {
        return personaId;
    }

    public void setPersonaId(Integer personaId) {
        this.personaId = personaId;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public Integer getIdGenero() {
        return idGenero;
    }

    public void setIdGenero(Integer idGenero) {
        this.idGenero = idGenero;
    }

    // === Factory desde la entidad ===
   public static UsuarioView from(Usuario u) {
    UsuarioView v = new UsuarioView();

    v.setIdUsuario(u.getIdUsuario());
    v.setActivo(u.isActivo());

    
    
    if (u.getRol() != null) {
        v.setRolId(u.getRol().getIdRol());
    }

    Persona p = u.getPersona();
    if (p != null) {
        v.setPersonaId(p.getIdPersona());
        v.setNombre(p.getNombre());
        v.setCorreo(p.getCorreo());
        v.setIdGenero(p.getIdGenero());
        v.setApellido(p.getApellido());
    }

    return v;
}
}