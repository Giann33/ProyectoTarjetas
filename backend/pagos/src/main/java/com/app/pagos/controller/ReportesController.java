package com.app.pagos.controller;

import com.app.pagos.repository.ReportesRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
public class ReportesController {

    // === DTOs locales (puedes moverlos a dto/ más adelante) ===

    // tamano = tamaño de página
    public record PageDTO<T>(
            List<T> items,
            int pagina,
            int tamano,
            int totalPaginas,
            long totalItems
    ) {}

    // 6.1.1 Reporte de estado
    public record ReporteEstadoDTO(
            String estado,
            String servicio,
            String comercio,
            BigDecimal monto,
            String fecha,
            String factura
    ) {}

    // 6.1.2 Reporte de operaciones duplicadas
    public record ReporteDuplicadasDTO(
            String idTransaccion,
            String servicio,
            String comercio,
            BigDecimal monto,
            String fecha,
            String motivo
    ) {}

    // 6.1.6 Reporte de auditoría de bitácora
    public record ReporteBitacoraDTO(
            String fecha,
            String modulo,
            String accion,
            int idUsuario,
            String nombreUsuario,
            String correoUsuario,
            String rolUsuario,
            int idReporte,
            int idTransaccion,
            String estadoTransaccion,
            String tipoTransaccion,
            String servicio,
            String comercio,
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
                                                   @RequestParam(defaultValue = "10") int tamano,
                                                   @RequestParam(defaultValue = "FACTURA") String orden) {

        // Traemos todos los registros que calzan con los filtros desde la BD
        List<ReporteEstadoDTO> items = reportesRepository.obtenerReporteEstado(fecha, estado, orden);

        // Paginación en memoria
        int totalItems = items.size();
        int fromIndex = Math.max(0, (pagina - 1) * tamano);
        int toIndex = Math.min(totalItems, fromIndex + tamano);

        List<ReporteEstadoDTO> pageItems =
                (fromIndex < toIndex) ? items.subList(fromIndex, toIndex) : List.of();

        int totalPaginas = (int) Math.ceil(totalItems / (double) tamano);

        return new PageDTO<>(pageItems, pagina, tamano, totalPaginas, totalItems);
    }

    // === 6.1.2 Reporte de operaciones duplicadas ===
    @GetMapping("/reporte-duplicadas")
    public PageDTO<ReporteDuplicadasDTO> reporteDuplicadas(@RequestParam String fechaInicio,
                                                           @RequestParam String fechaFin,
                                                           @RequestParam(defaultValue = "1") int pagina,
                                                           @RequestParam(defaultValue = "10") int tamano) {

        // Traemos todos los registros del rango desde la BD
        List<ReporteDuplicadasDTO> items = reportesRepository.obtenerReporteDuplicadas(fechaInicio, fechaFin);

        // Paginación en memoria
        int totalItems = items.size();
        int fromIndex = Math.max(0, (pagina - 1) * tamano);
        int toIndex = Math.min(totalItems, fromIndex + tamano);

        List<ReporteDuplicadasDTO> pageItems =
                (fromIndex < toIndex) ? items.subList(fromIndex, toIndex) : List.of();

        int totalPaginas = (int) Math.ceil(totalItems / (double) tamano);

        return new PageDTO<>(pageItems, pagina, tamano, totalPaginas, totalItems);
    }

    // === 6.1.6 Reporte de auditoría de bitácora ===
    @GetMapping("/reporte-bitacora")
    public PageDTO<ReporteBitacoraDTO> reporteBitacora(@RequestParam String fechaInicio,
                                                       @RequestParam String fechaFin,
                                                       @RequestParam(defaultValue = "TODOS") String modulo,
                                                       @RequestParam(defaultValue = "1") int pagina,
                                                       @RequestParam(defaultValue = "10") int tamano) {

        List<ReporteBitacoraDTO> items =
                reportesRepository.obtenerReporteBitacora(fechaInicio, fechaFin, modulo);

        int totalItems = items.size();
        int fromIndex = Math.max(0, (pagina - 1) * tamano);
        int toIndex = Math.min(totalItems, fromIndex + tamano);

        List<ReporteBitacoraDTO> pageItems =
                (fromIndex < toIndex) ? items.subList(fromIndex, toIndex) : List.of();

        int totalPaginas = (int) Math.ceil(totalItems / (double) tamano);

        return new PageDTO<>(pageItems, pagina, tamano, totalPaginas, totalItems);
    }
}


