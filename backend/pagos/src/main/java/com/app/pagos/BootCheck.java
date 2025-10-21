package com.app.pagos;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class BootCheck implements CommandLineRunner {
    private final JdbcTemplate jdbc;

    public BootCheck(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(String... args) {
        Integer one = jdbc.queryForObject("SELECT 1", Integer.class);
        System.out.println("✅ Conexión OK: " + one);

        // 👇 CAMBIA AQUÍ TUS DATOS
        String nombre = "Carlos";
        String correo = "carlos@example.com";

        // Upsert para no fallar si ya existe el correo (UNIQUE)
        int rows = jdbc.update(
                "INSERT INTO usuario (nombre, correo) VALUES (?, ?) " +
                        "ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)",
                nombre, correo);
        System.out.println("upsert rows=" + rows);

        Integer usuarios = jdbc.queryForObject("SELECT COUNT(*) FROM usuario", Integer.class);
        System.out.println("usuario.rows=" + usuarios);
    }
}
