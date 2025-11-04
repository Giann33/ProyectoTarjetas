package com.app.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.app.pagos.dto.LoginResponse;
import com.app.pagos.entity.Usuario;
import com.app.pagos.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final UsuarioRepository usuarioRepo;
  private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

  /**
   * Autentica por correo + contraseña (plano).
   * Lanza RuntimeException con mensaje claro si falla.
   */
  public LoginResponse login(String correo, String passwordPlano) {

    Usuario u = usuarioRepo.findByCorreo(correo)
        .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));

    if (u.getActivo() == null || !u.getActivo()) {
      throw new RuntimeException("Usuario inactivo");
    }

    if (!encoder.matches(passwordPlano, u.getContrasenna())) {
      throw new RuntimeException("Credenciales inválidas");
    }

    // Si quieres “idUsuario” en el DTO, renómbralo allí.
    return new LoginResponse(
        u.getIdUsuario(),
        u.getNombre(),
        u.getCorreo(),
        u.getRol());
  }
}
