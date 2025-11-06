// src/main/java/com/app/pagos/service/AuthService.java
package com.app.pagos.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.app.pagos.config.JwtService;
import com.app.pagos.dto.LoginResponse;
import com.app.pagos.entity.Persona;
import com.app.pagos.entity.Usuario;
//import com.app.pagos.entity.Usuario;
import com.app.pagos.repository.PersonaRepository;
import com.app.pagos.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class AuthService {
  private final PersonaRepository personaRepository;
  private final UsuarioRepository usuarioRepository;
  private final PasswordEncoder passwordEncoder; // BCrypt
  private final JwtService jwtService;

  public LoginResponse login(String correo, String rawPassword) {
    // normaliza el correo
    String email = correo == null ? null : correo.trim().toLowerCase();

    Persona persona = personaRepository.findByCorreo(email)
        .orElseThrow(() -> new RuntimeException("Correo no registrado"));

    // si en BD la contraseña está hasheada (BCrypt), usa matches
    if (!passwordEncoder.matches(rawPassword, persona.getContrasenna())) {
      throw new RuntimeException("Contraseña incorrecta");
    }

    Usuario usuario = usuarioRepository.findByPersona_IdPersona(persona.getIdPersona())
        .orElseThrow(() -> new RuntimeException("Usuario no encontrado para esta persona"));

    String token = jwtService.generateToken(persona.getCorreo());

    return new LoginResponse(
        token,
        usuario.getIdUsuario(),
        persona.getIdPersona()
    );
  }
}
