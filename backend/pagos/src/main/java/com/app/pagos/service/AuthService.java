package com.app.pagos.service;


import com.app.pagos.dto.LoginResponse;
import com.app.pagos.entity.Persona;
import com.app.pagos.repository.PersonaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final PersonaRepository personaRepo;
  private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

  public LoginResponse login(String correo, String passwordPlano) {
    Persona p = personaRepo.findByCorreo(correo)
        .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));

    if (p.getActivo() == null || !p.getActivo())
      throw new RuntimeException("Usuario inactivo");

    if (!encoder.matches(passwordPlano, p.getContrasenna()))
      throw new RuntimeException("Credenciales inválidas");

    return new LoginResponse(p.getIdPersona(), p.getNombre(), p.getCorreo(), p.getRol());
  }
}