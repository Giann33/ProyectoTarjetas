// src/main/java/com/app/pagos/config/SeedAdmin.java
package com.app.pagos.config;

import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.app.pagos.entity.Usuario;
import com.app.pagos.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class SeedAdmin implements CommandLineRunner {

    private final UsuarioRepository usuarioRepo;

    @Override
    public void run(String... args) {
        final String correo = "admin@local";

        if (!usuarioRepo.existsByCorreo(correo)) {
            var encoder = new BCryptPasswordEncoder();

            Usuario admin = Usuario.builder()
                    .nombre("Administrador")
                    .correo(correo)
                    .contrasenna(encoder.encode("admin123"))
                    .rol(1)
                    .activo(true)
                    .fechaCreacion(LocalDateTime.now())
                    .fechaModificacion(LocalDateTime.now())
                    .build();

            usuarioRepo.save(admin);
        }
    }
}
