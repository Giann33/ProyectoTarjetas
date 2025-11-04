// src/main/java/com/app/pagos/service/AuthService.java
package com.app.pagos.service;

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

    public LoginResponse login(String correo, String password) {
        Usuario u = usuarioRepo.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!encoder.matches(password, u.getContrasenna())) {
            throw new RuntimeException("Credenciales inválidas");
        }

        // Ajusta los campos según tu LoginResponse
        return new LoginResponse(
                u.getIdUsuario(), // o u.getId()
                u.getNombre(),
                u.getCorreo(),
                "OK");
    }
}
