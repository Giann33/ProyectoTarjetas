package com.app.pagos.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
// UsuarioService.java
import org.springframework.stereotype.Service;

import com.app.pagos.dto.CrearUsuarioRequest;
import com.app.pagos.dto.EditarUsuarioRequest;
import com.app.pagos.dto.UsuarioView;
import com.app.pagos.entity.Persona;
import com.app.pagos.entity.Rol;
import com.app.pagos.entity.Usuario;
import com.app.pagos.repository.PersonaRepository;
import com.app.pagos.repository.UsuarioRepository;

import jakarta.transaction.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PersonaRepository personaRepository; // si no existe, crea el repo
    private final PasswordEncoder passwordEncoder; // el mismo que usas en login

    public UsuarioService(UsuarioRepository usuarioRepository,
            PersonaRepository personaRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.personaRepository = personaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<Usuario> consultarPorId(Integer idUsuario) {
        return usuarioRepository.findByIdUsuario(idUsuario); // <- aquí
    }

    @Transactional
    public UsuarioView actualizarUsuario(Integer idUsuario, EditarUsuarioRequest dto) {

        Usuario usuario = usuarioRepository.findByIdUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Persona persona = usuario.getPersona();
        if (persona == null) {
            throw new RuntimeException("El usuario no tiene persona asociada");
        }

        // === Actualizar datos de Persona ===
        if (dto.getNombre() != null) {
            persona.setNombre(dto.getNombre());
        }
        if (dto.getApellido() != null) {
            persona.setApellido(dto.getApellido());
        }
        if (dto.getCorreo() != null) {
            persona.setCorreo(dto.getCorreo());
        }
        if (dto.getIdGenero() != null) {
            persona.setIdGenero(dto.getIdGenero());
        }

        // === SOLO cambiar contraseña si viene y no está vacía ===
        if (dto.getContrasena() != null && !dto.getContrasena().isBlank()) {
            String hash = passwordEncoder.encode(dto.getContrasena());
            persona.setContrasenna(hash);
        }
        // Si NO viene 'contrasena', se deja tal cual está en BD

        // === Rol (solo si permites cambiarlo) ===
        if (dto.getIdRol() != null) {
            // aquí según tu modelo real (catalogo_rol_usuario, etc.)
            usuario.getRol().setIdRol(dto.getIdRol());
        }

        personaRepository.save(persona);
        usuarioRepository.save(usuario);

        return UsuarioView.from(usuario);
    }

     @Transactional
    public UsuarioView crearUsuario(CrearUsuarioRequest dto) {

        // 1) Crear Persona
        Persona persona = new Persona();
        persona.setNombre(dto.getNombre());
        persona.setApellido(dto.getApellido());          // si existe en la entidad
        persona.setCorreo(dto.getCorreo());
        persona.setContrasenna(passwordEncoder.encode(dto.getContrasenna()));
        persona.setIdGenero(dto.getIdGenero());
        persona.setActivo(dto.getActivo() != null ? dto.getActivo() : true);
        persona.setFechaCreacion(java.time.LocalDateTime.now());
        persona.setFechaModificacion(java.time.LocalDateTime.now());

        personaRepository.save(persona);

        // 2) Crear Usuario ligado a esa Persona
        Usuario usuario = new Usuario();
        usuario.setPersona(persona);
        usuario.setActivo(dto.getActivo() != null ? dto.getActivo() : true);

        // Asignar rol (depende de cómo tengas tu entidad de rol)
        if (dto.getIdRol() != null) {
            var rol = usuario.getRol();
            if (rol == null) {
                rol = new Rol(); // o como se llame tu entity / clase
            }
            rol.setIdRol(dto.getIdRol());
            usuario.setRol(rol);
        }

        usuarioRepository.save(usuario);

        // 3) Devolver vista
        return UsuarioView.from(usuario);
    }

@Transactional
public void eliminarUsuario(Integer idUsuario) {

    Usuario usuario = usuarioRepository.findByIdUsuario(idUsuario)
        .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

    // Desactivar usuario
    usuario.setActivo(false);
    usuarioRepository.save(usuario);

    // Desactivar persona asociada
    Persona persona = usuario.getPersona();
    if (persona != null) {
        persona.setActivo(false);
        personaRepository.save(persona);
    }
}

}
