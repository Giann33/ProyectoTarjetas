package com.app.pagos.service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.pagos.config.JwtService;
import com.app.pagos.dto.LoginResponse;
import com.app.pagos.dto.RegisterRequest;
import com.app.pagos.entity.Persona;
import com.app.pagos.entity.Rol;
import com.app.pagos.entity.Usuario;
import com.app.pagos.repository.PersonaRepository;
import com.app.pagos.repository.RolRepository;
import com.app.pagos.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final PersonaRepository personaRepository;
  private final UsuarioRepository usuarioRepository;
  private final RolRepository rolRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  // --- LOGIN (Sin cambios) ---
  public LoginResponse login(String correo, String rawPassword) {
    String email = correo == null ? null : correo.trim().toLowerCase();
    Persona persona = personaRepository.findByCorreo(email)
        .orElseThrow(() -> new RuntimeException("Correo no registrado"));

    if (!passwordEncoder.matches(rawPassword, persona.getContrasenna())) {
      throw new RuntimeException("Contraseña incorrecta");
    }

    Usuario usuario = usuarioRepository.findByPersonaIdPersona(persona.getIdPersona())
        .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

    String token = jwtService.generateToken(persona.getCorreo());
    return new LoginResponse(token, usuario.getIdUsuario(), persona.getIdPersona(), usuario.getRol().getIdRol());
  }

  // --- REGISTRO CON LÓGICA INTELIGENTE ---
  @Transactional
  public Usuario registrar(RegisterRequest req) {

    // 1. Validar correo
    if (personaRepository.findByCorreo(req.correo()).isPresent()) {
      throw new RuntimeException("El correo ya está registrado.");
    }

    // 2. Guardar Persona
    Persona persona = new Persona();
    persona.setNombre(req.nombre());
    persona.setApellido(req.apellidos());
    persona.setCorreo(req.correo());
    persona.setContrasenna(passwordEncoder.encode(req.contrasena()));
    persona.setIdGenero(req.genero());

    // Datos automáticos
    persona.setFechaCreacion(LocalDateTime.now());
    persona.setFechaModificacion(LocalDateTime.now());
    persona.setActivo(true); 

    // Guardamos Persona
    persona = personaRepository.save(persona);

    // 3. Crear Usuario
    Usuario usuario = new Usuario();
    usuario.setPersona(persona);
    usuario.setActivo(true);

    // --- LÓGICA CORREGIDA: AUTO-CREAR ROL ---
    // ID del rol a buscar (viene del frontend o es 2 por defecto)
    Integer targetRolId = (req.idRol() != null) ? req.idRol() : 2;

    // Buscamos si el rol existe
    Rol rolFinal = rolRepository.findById(targetRolId).orElse(null);

    if (rolFinal == null) {
      // SI NO EXISTE: Lo creamos en ese mismo instante
      Rol nuevoRol = new Rol();
      nuevoRol.setIdRol(targetRolId);
      // Si es ID 1 es Admin, si es otro es Usuario
      nuevoRol.setDescripcion(targetRolId == 1 ? "Administrador" : "Usuario Regular");
      nuevoRol.setActivo(true);

      // ¡IMPORTANTE! Lo guardamos en BD antes de usarlo
      rolFinal = rolRepository.save(nuevoRol);
      System.out.println("Sistema: Se ha auto-creado el Rol con ID " + targetRolId);
    }

    // Asignamos el rol (ya sea el que encontramos o el que acabamos de crear)
    usuario.setRol(rolFinal);
    // -----------------------------------------

    return usuarioRepository.save(usuario);
  }
}