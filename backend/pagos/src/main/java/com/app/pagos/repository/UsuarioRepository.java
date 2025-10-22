package com.app.pagos.repository;

import com.app.pagos.dto.UsuarioView;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class UsuarioRepository {

    private final JdbcTemplate jdbc;

    public UsuarioRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // Mapea cada fila del ResultSet a nuestro DTO UsuarioView
    private static final RowMapper<UsuarioView> MAP = (rs, rowNum) -> new UsuarioView(
            rs.getInt("id_persona"),
            rs.getString("nombre"),
            rs.getBoolean("PersonaActiva"),
            rs.getString("Correo_Electronico"),
            rs.getString("TipoCorreo")
    );

    // Consulta por ID de persona (usa tus nombres reales de tablas/campos)
    private static final String SQL_POR_ID = """
        SELECT 
            p.id_persona,
            p.nombre,
            p.Activo AS PersonaActiva,
            ce.Correo_Electronico,
            cce.Descripcion AS TipoCorreo
        FROM Persona p
        LEFT JOIN Correo_Electronico ce 
            ON ce.idPersona = p.id_persona AND ce.Activo = 1
        LEFT JOIN Catalogo_Correo_Electronico cce 
            ON cce.idCatalogo_Correo_Electronico = ce.idCatalogo_Correo_Electronico
        WHERE p.id_persona = ?
    """;

    // Consulta por correo exacto
    private static final String SQL_POR_CORREO = """
        SELECT 
            p.id_persona,
            p.nombre,
            p.Activo AS PersonaActiva,
            ce.Correo_Electronico,
            cce.Descripcion AS TipoCorreo
        FROM Correo_Electronico ce
        INNER JOIN Persona p ON p.id_persona = ce.idPersona
        LEFT JOIN Catalogo_Correo_Electronico cce 
            ON cce.idCatalogo_Correo_Electronico = ce.idCatalogo_Correo_Electronico
        WHERE ce.Correo_Electronico = ? AND ce.Activo = 1
    """;

    public List<UsuarioView> findByIdPersona(int idPersona) {
        return jdbc.query(SQL_POR_ID, MAP, idPersona);
    }

    public List<UsuarioView> findByCorreo(String correo) {
        return jdbc.query(SQL_POR_CORREO, MAP, correo);
    }
}

