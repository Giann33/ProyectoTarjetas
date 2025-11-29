package com.app.pagos.controller;

import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
public class ReportesController {

    // === DTOs locales (puedes moverlos a dto/ más adelante) ===
    record PingDTO(String ok) {}
    record PageDTO<T>(List<T> items, int pagina, int tamanio, int totalPaginas, long totalItems) {}
    record ReporteEstadoDTO(String estado, String comercio, BigDecimal monto, String fecha, String factura) {}
    record ReporteDuplicadasDTO(String idTransaccion, String comercio, BigDecimal monto, String fecha, String motivo) {}
    record ReporteNotificacionesDTO(String idNotificacion, String tipo, String destinatario, String estado, String fechaEnvio) {}
    // 6.1.4
    record ReporteCargaPuntoDTO(String hora, int trafico) {}
    record ReporteCargaDTO(List<ReporteCargaPuntoDTO> serie) {}
    // 6.1.5
    record ReporteRespuestaDTO(String endpoint, String metodo, int promedioMs, int p95Ms, int p99Ms, int minMs, int maxMs, String fecha) {}

    // Health check
  /*  @GetMapping("/ping")
    public PingDTO ping() {
        return new PingDTO("reportes-up");
    }*/

    // === 6.1.1 Reporte diario de transacciones autorizadas/rechazadas ===
    @GetMapping("/reporte-estado")
    public PageDTO<ReporteEstadoDTO> reporteEstado(@RequestParam String fecha,
                                                   @RequestParam(defaultValue = "TODOS") String estado,
                                                   @RequestParam(defaultValue = "1") int pagina,
                                                   @RequestParam(defaultValue = "10") int tamanio,
                                                   @RequestParam(defaultValue = "FACTURA") String orden) {

        var items = List.of(
            new ReporteEstadoDTO("Completada", "ACME", new BigDecimal("1220000.00"), fecha, "39842-231"),
            new ReporteEstadoDTO("Rechazada",  "ACME", new BigDecimal("220000.00"),  fecha, "39842-000"),
            new ReporteEstadoDTO("Completada", "John Doe Ltd.", new BigDecimal("2233000.00"), fecha, "39841-231")
        );

        return new PageDTO<>(items, pagina, tamanio, 5, 44);
    }

    // === 6.1.2 Reporte de operaciones duplicadas ===
    @GetMapping("/reporte-duplicadas")
    public PageDTO<ReporteDuplicadasDTO> reporteDuplicadas(@RequestParam String fechaInicio,
                                                           @RequestParam String fechaFin,
                                                           @RequestParam(defaultValue = "1") int pagina,
                                                           @RequestParam(defaultValue = "10") int tamanio) {

        var items = List.of(
            new ReporteDuplicadasDTO("TXN-1001", "ACME",        new BigDecimal("10500.00"), fechaInicio, "Autorización repetida"),
            new ReporteDuplicadasDTO("TXN-1002", "GlobalPay",   new BigDecimal("6000.00"),  fechaInicio, "Transacción duplicada en lote"),
            new ReporteDuplicadasDTO("TXN-1003", "SuperTienda", new BigDecimal("15500.00"), fechaFin,    "Intento repetido en menos de 2s")
        );

        return new PageDTO<>(items, pagina, tamanio, 3, 30);
    }

    // === 6.1.3 Reporte de notificaciones enviadas ===
    @GetMapping("/reporte-notificaciones")
    public PageDTO<ReporteNotificacionesDTO> reporteNotificaciones(@RequestParam String fechaInicio,
                                                                   @RequestParam String fechaFin,
                                                                   @RequestParam(defaultValue = "1") int pagina,
                                                                   @RequestParam(defaultValue = "10") int tamanio) {

        var items = List.of(
            new ReporteNotificacionesDTO("NTF-001", "Correo", "cliente@acme.com", "Enviada", fechaInicio),
            new ReporteNotificacionesDTO("NTF-002", "SMS",    "50688997744",      "Fallida", fechaInicio),
            new ReporteNotificacionesDTO("NTF-003", "Push",   "user123",          "Enviada", fechaFin)
        );

        return new PageDTO<>(items, pagina, tamanio, 2, 20);
    }

    // === 6.1.4 Reporte de carga transaccional ===
    @GetMapping("/reporte-carga")
    public ReporteCargaDTO reporteCarga(@RequestParam(defaultValue = "diario") String rango) {
        var serie = List.of(
            new ReporteCargaPuntoDTO("08:00", 12),
            new ReporteCargaPuntoDTO("10:00", 24),
            new ReporteCargaPuntoDTO("13:00", 48),
            new ReporteCargaPuntoDTO("16:00", 36),
            new ReporteCargaPuntoDTO("19:00", 68),
            new ReporteCargaPuntoDTO("22:00", 18)
        );
        return new ReporteCargaDTO(serie);
    }

    // === 6.1.5 Reporte de tiempos de respuesta ===
    @GetMapping("/reporte-respuesta")
    public PageDTO<ReporteRespuestaDTO> reporteRespuesta(@RequestParam String fechaInicio,
                                                         @RequestParam String fechaFin,
                                                         @RequestParam(defaultValue = "1") int pagina,
                                                         @RequestParam(defaultValue = "10") int tamanio) {

        var items = List.of(
            new ReporteRespuestaDTO("/api/pagos/autorizar", "POST", 180, 350, 520, 90,  720, fechaInicio),
            new ReporteRespuestaDTO("/api/pagos/consulta",  "GET",   95, 180, 290, 40,  420, fechaInicio),
            new ReporteRespuestaDTO("/api/pagos/anular",    "POST", 210, 420, 610, 110, 820, fechaFin)
        );

        return new PageDTO<>(items, pagina, tamanio, 2, 20);
    }
}





