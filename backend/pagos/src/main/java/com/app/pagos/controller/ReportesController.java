package com.app.pagos.controller;

import com.app.pagos.repository.ReportesRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
public class ReportesController {

    // === DTOs locales (puedes moverlos a dto/ más adelante) ===
    public record PageDTO<T>(List<T> items, int pagina, int tamanio, int totalPaginas, long totalItems) {}

    public record ReporteEstadoDTO(
            String estado,
            String comercio,
            BigDecimal monto,
            String fecha,
            String factura
    ) {}

    public record ReporteDuplicadasDTO(
            String idTransaccion,
            String comercio,
            BigDecimal monto,
            String fecha,
            String motivo
    ) {}

    // === NUEVO: DTO para reporte de auditoría de bitácora ===
    public record ReporteBitacoraDTO(
            String fecha,
            String modulo,
            String accion,
            Integer idUsuario,
            String nombreCompleto,
            String correo,
            String rol,
            Integer idReporte,
            Integer idTransaccion,
            String estadoTransaccion,
            String tipoTransaccion,
            String servicio,
            BigDecimal monto,
            String moneda
    ) {}

    private final ReportesRepository reportesRepository;

    // Inyección por constructor
    public ReportesController(ReportesRepository reportesRepository) {
        this.reportesRepository = reportesRepository;
    }

    // === 6.1.1 Reporte diario de transacciones autorizadas/rechazadas ===
    @GetMapping("/reporte-estado")
    public PageDTO<ReporteEstadoDTO> reporteEstado(@RequestParam String fecha,
                                                   @RequestParam(defaultValue = "TODOS") String estado,
                                                   @RequestParam(defaultValue = "1") int pagina,
                                                   @RequestParam(defaultValue = "10") int tamanio,
                                                   @RequestParam(defaultValue = "FACTURA") String orden) {

        // Traemos todos los registros que calzan con los filtros desde la BD
        List<ReporteEstadoDTO> items = reportesRepository.obtenerReporteEstado(fecha, estado, orden);

        // Paginación sencilla en memoria
        int totalItems = items.size();
        int fromIndex = Math.max(0, (pagina - 1) * tamanio);
        int toIndex = Math.min(totalItems, fromIndex + tamanio);

        List<ReporteEstadoDTO> pageItems =
                (fromIndex < toIndex) ? items.subList(fromIndex, toIndex) : List.of();

        int totalPaginas = (int) Math.ceil(totalItems / (double) tamanio);

        return new PageDTO<>(pageItems, pagina, tamanio, totalPaginas, totalItems);
    }

    // === 6.1.2 Reporte de operaciones duplicadas ===
    @GetMapping("/reporte-duplicadas")
    public PageDTO<ReporteDuplicadasDTO> reporteDuplicadas(@RequestParam String fechaInicio,
                                                           @RequestParam String fechaFin,
                                                           @RequestParam(defaultValue = "1") int pagina,
                                                           @RequestParam(defaultValue = "10") int tamanio) {

        // Traemos todos los registros del rango desde la BD
        List<ReporteDuplicadasDTO> items = reportesRepository.obtenerReporteDuplicadas(fechaInicio, fechaFin);

        // Paginación sencilla en memoria
        int totalItems = items.size();
        int fromIndex = Math.max(0, (pagina - 1) * tamanio);
        int toIndex = Math.min(totalItems, fromIndex + tamanio);

        List<ReporteDuplicadasDTO> pageItems =
                (fromIndex < toIndex) ? items.subList(fromIndex, toIndex) : List.of();

        int totalPaginas = (int) Math.ceil(totalItems / (double) tamanio);

        return new PageDTO<>(pageItems, pagina, tamanio, totalPaginas, totalItems);
    }

    // === 6.1.6 Reporte de auditoría de bitácora ===
    @GetMapping("/reporte-bitacora")
    public PageDTO<ReporteBitacoraDTO> reporteBitacora(@RequestParam String fechaInicio,
                                                       @RequestParam String fechaFin,
                                                       @RequestParam(defaultValue = "TODOS") String modulo,
                                                       @RequestParam(defaultValue = "1") int pagina,
                                                       @RequestParam(defaultValue = "10") int tamanio) {

        // Traemos todos los registros del rango desde la BD
        List<ReporteBitacoraDTO> items =
                reportesRepository.obtenerReporteBitacora(fechaInicio, fechaFin, modulo);

        // Paginación sencilla en memoria
        int totalItems = items.size();
        int fromIndex = Math.max(0, (pagina - 1) * tamanio);
        int toIndex = Math.min(totalItems, fromIndex + tamanio);

        List<ReporteBitacoraDTO> pageItems =
                (fromIndex < toIndex) ? items.subList(fromIndex, toIndex) : List.of();

        int totalPaginas = (int) Math.ceil(totalItems / (double) tamanio);

        return new PageDTO<>(pageItems, pagina, tamanio, totalPaginas, totalItems);
    }
}


