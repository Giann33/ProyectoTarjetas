package com.app.pagos.config;

import com.app.pagos.entity.Persona;
import com.app.pagos.repository.PersonaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
public class SeedAdmin implements CommandLineRunner {

    private final PersonaRepository personaRepo;

    @Override
    public void run(String... args) {
        var correo = "admin@local";

        if (personaRepo.findByCorreo(correo).isEmpty()) {
            var encoder = new BCryptPasswordEncoder();

            personaRepo.save(Persona.builder()
                    .nombre("Administrador")          // ✅ minúsculas
                    .correo(correo)                   // ✅ minúsculas
                    .contrasenna(encoder.encode("admin123"))
                    .rol(1)
                    .activo(true)
                    .fechaCreacion(LocalDateTime.now())
                    .fechaModificacion(LocalDateTime.now())
                    .idGenero(1)
                    .build());
        }
    }
}
