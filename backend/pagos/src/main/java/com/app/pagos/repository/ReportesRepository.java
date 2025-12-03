package com.app.pagos.repository;

import com.app.pagos.controller.ReportesController.ReporteEstadoDTO;
import com.app.pagos.controller.ReportesController.ReporteDuplicadasDTO;
import com.app.pagos.controller.ReportesController.ReporteBitacoraDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ReportesRepository {

    private final JdbcTemplate jdbcTemplate;

    public ReportesRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // ============ 6.1.1 Reporte de estado ============

    public List<ReporteEstadoDTO> obtenerReporteEstado(String fecha,
                                                       String estadoFiltro,
                                                       String orden) {

        String sql = """
            SELECT
                ce.Descripcion  AS estado,
                s.Descripcion   AS servicio,
                t.destino       AS comercio,
                p.Monto         AS monto,
                DATE(t.Fecha)   AS fecha,
                t.detalle       AS factura
            FROM transaccion t
            JOIN catalogo_estado_transaccion ce
                 ON ce.idEstadoTransaccion = t.Estado
            JOIN servicio s
                 ON s.idServicio = t.servicio_idServicio
            JOIN pago p
                 ON p.Transaccion_idTransaccion = t.idTransaccion
            WHERE DATE(t.Fecha) = ?
            """;

        // === Filtrado por estado ===
        if (!estadoFiltro.equalsIgnoreCase("TODOS")) {
            sql += " AND ce.Descripcion = ? ";
        }

        // === Ordenamiento ===
        sql += switch (orden.toUpperCase()) {
            case "MONTO" -> " ORDER BY p.Monto ";
            case "FECHA" -> " ORDER BY t.Fecha ";
            default      -> " ORDER BY t.detalle ";
        };

        if (estadoFiltro.equalsIgnoreCase("TODOS")) {
            return jdbcTemplate.query(
                    sql,
                    (rs, rowNum) -> new ReporteEstadoDTO(
                            rs.getString("estado"),
                            rs.getString("servicio"),
                            rs.getString("comercio"),
                            rs.getBigDecimal("monto"),
                            rs.getString("fecha"),
                            rs.getString("factura")
                    ),
                    fecha
            );
        } else {
            return jdbcTemplate.query(
                    sql,
                    (rs, rowNum) -> new ReporteEstadoDTO(
                            rs.getString("estado"),
                            rs.getString("servicio"),
                            rs.getString("comercio"),
                            rs.getBigDecimal("monto"),
                            rs.getString("fecha"),
                            rs.getString("factura")
                    ),
                    fecha,
                    estadoFiltro
            );
        }
    }

    // ============ 6.1.2 Reporte de operaciones duplicadas ============

    public List<ReporteDuplicadasDTO> obtenerReporteDuplicadas(String fechaInicio,
                                                               String fechaFin) {

        String sql = """
            SELECT
                t.idTransaccion      AS idTransaccion,
                s.Descripcion        AS servicio,
                t.destino            AS comercio,
                p.Monto              AS monto,
                r.Fecha_Reverso      AS fecha,
                r.Motivo             AS motivo
            FROM reverso_devolucion r
            JOIN transaccion t
                  ON t.idTransaccion = r.idTransaccion
            JOIN servicio s
                  ON s.idServicio = t.servicio_idServicio
            JOIN pago p
                  ON p.Transaccion_idTransaccion = t.idTransaccion
            WHERE DATE(r.Fecha_Reverso) BETWEEN ? AND ?
            ORDER BY r.Fecha_Reverso DESC
            """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new ReporteDuplicadasDTO(
                        String.valueOf(rs.getInt("idTransaccion")),
                        rs.getString("servicio"),
                        rs.getString("comercio"),
                        rs.getBigDecimal("monto"),
                        rs.getString("fecha"),
                        rs.getString("motivo")
                ),
                fechaInicio,
                fechaFin
        );
    }

    // ============ 6.1.6 Reporte de auditoría de bitácora ============

    public List<ReporteBitacoraDTO> obtenerReporteBitacora(String fechaInicio,
                                                           String fechaFin,
                                                           String moduloFiltro) {

        String sql = """
            SELECT
                b.Fecha                 AS fecha,
                b.Modulo                AS modulo,
                b.Accion                AS accion,
                u.idUsuario             AS idUsuario,
                per.Nombre              AS nombre,
                per.apellido            AS apellido,
                per.Correo              AS correo,
                rol.Descripcion         AS rol,
                rt.idReporte            AS idReporte,
                t.idTransaccion         AS idTransaccion,
                ce.Descripcion          AS estadoTransaccion,
                ct.Descripcion          AS tipoTransaccion,
                s.Descripcion           AS servicio,
                t.destino               AS comercio,
                pgo.Monto               AS monto,
                mon.Simbolo             AS moneda
            FROM bitacora b
            JOIN usuario u
                 ON u.idUsuario = b.Usuario_idCliente
            JOIN persona per
                 ON per.idPersona = u.Persona_idUsuario
            JOIN catalogo_rol_usuario rol
                 ON rol.idRol = u.catalogo_rol_usuario_idRol
            JOIN reporte_transaccion rt
                 ON rt.idReporte = b.reporte_transaccion_idReporte
            JOIN transaccion t
                 ON t.idTransaccion = rt.Transaccion_idTransaccion
            JOIN catalogo_estado_transaccion ce
                 ON ce.idEstadoTransaccion = t.Estado
            JOIN catalogo_tipo_transaccion ct
                 ON ct.idTipoTransaccion = t.Tipo
            JOIN servicio s
                 ON s.idServicio = t.servicio_idServicio
            LEFT JOIN pago pgo
                 ON pgo.Transaccion_idTransaccion = t.idTransaccion
            LEFT JOIN catalogo_tipo_moneda mon
                 ON mon.idTipoMoneda = pgo.catalogo_tipo_moneda_idTipoMoneda
            WHERE DATE(b.Fecha) BETWEEN ? AND ?
            """;

        boolean filtraModulo = (moduloFiltro != null &&
                                !moduloFiltro.isBlank() &&
                                !"TODOS".equalsIgnoreCase(moduloFiltro));

        if (filtraModulo) {
            sql += " AND b.Modulo = ? ";
        }

        sql += " ORDER BY b.Fecha DESC";

        Object[] params = filtraModulo
                ? new Object[]{fechaInicio, fechaFin, moduloFiltro}
                : new Object[]{fechaInicio, fechaFin};

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new ReporteBitacoraDTO(
                        rs.getTimestamp("fecha").toString(),
                        rs.getString("modulo"),
                        rs.getString("accion"),
                        rs.getInt("idUsuario"),
                        rs.getString("nombre") + " " + rs.getString("apellido"),
                        rs.getString("correo"),
                        rs.getString("rol"),
                        rs.getInt("idReporte"),
                        rs.getInt("idTransaccion"),
                        rs.getString("estadoTransaccion"),
                        rs.getString("tipoTransaccion"),
                        rs.getString("servicio"),
                        rs.getString("comercio"),
                        rs.getBigDecimal("monto"),
                        rs.getString("moneda")
                ),
                params
        );
    }
}



