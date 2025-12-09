package com.app.pagos.controller;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.pagos.dto.TransaccionViewConsulta;
import com.app.pagos.entity.Bitacora;
import com.app.pagos.entity.Cuenta;
import com.app.pagos.entity.Pago;
import com.app.pagos.entity.ReporteTransaccion;
import com.app.pagos.entity.ReversoDevolucion;
import com.app.pagos.entity.Transaccion;
import com.app.pagos.entity.Usuario;
import com.app.pagos.repository.BitacoraRepository;
import com.app.pagos.repository.CuentaRepository; // Importar
import com.app.pagos.repository.PagoRepository;
import com.app.pagos.repository.ReporteTransaccionRepository;
import com.app.pagos.repository.ReversoDevolucionRepository;

import jakarta.transaction.Transactional; // Importar para asegurar integridad

@RestController
@RequestMapping("/api/reversos")
@CrossOrigin(origins = "*")
public class ReversoController {

    @Autowired
    private PagoRepository pagoRepository;

    @Autowired
    private ReversoDevolucionRepository reversoRepository;

    // --- NUEVO: Necesitamos este repositorio para actualizar el saldo ---
    @Autowired
    private CuentaRepository cuentaRepository;


    @Autowired
    private ReporteTransaccionRepository reporteTransaccionRepository;

    @Autowired
    private BitacoraRepository bitacoraRepository;

    private static final BigDecimal TIPO_CAMBIO_USD_CRC = new BigDecimal("500"); // 1 USD = 500 CRC
    private static final int MONEDA_COLONES = 1;
    private static final int MONEDA_DOLARES = 2;
    // ------------------------------------------------------------------

    // 1. LISTAR DUPLICADOS
    @GetMapping("/duplicados")
    public ResponseEntity<?> obtenerDuplicados() {
        try {
            List<Pago> todosLosPagos = pagoRepository.findAll();
            List<TransaccionViewConsulta> duplicadasView = new ArrayList<>();

            if (todosLosPagos.isEmpty())
                return ResponseEntity.ok(duplicadasView);

            Map<String, List<Pago>> agrupadas = todosLosPagos.stream()
                    .filter(p -> p.getTransaccion() != null)
                    .collect(Collectors.groupingBy(p -> {
                        Transaccion t = p.getTransaccion();
                        String idTarjeta = (t.getTarjeta() != null) ? t.getTarjeta().getIdTarjeta().toString() : "0";
                        String monto = (p.getMonto() != null) ? p.getMonto().toString() : "0";
                        String destino = (t.getDestino() != null) ? t.getDestino() : "N/A";
                        return idTarjeta + "-" + monto + "-" + destino;
                    }));

            for (List<Pago> grupo : agrupadas.values()) {
                if (grupo.size() > 1) {
                    for (Pago pago : grupo) {
                        try {
                            TransaccionViewConsulta dto = TransaccionViewConsulta.from(pago.getTransaccion(), pago);
                            if (reversoRepository.existsByIdTransaccion(dto.getIdTransaccion())) {
                                dto.setEstadoReverso("Completado");
                            } else {
                                dto.setEstadoReverso("Pendiente");
                            }
                            duplicadasView.add(dto);
                        } catch (Exception ex) {
                            System.err.println("Error mapeando: " + ex.getMessage());
                        }
                    }
                }
            }
            return ResponseEntity.ok(duplicadasView);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error interno: " + e.getMessage());
        }
    }

    // 2. CREAR REVERSO Y DEVOLVER DINERO
    @PostMapping("/{idTransaccion}")
@Transactional
public ResponseEntity<?> crearReverso(@PathVariable Integer idTransaccion) {
    try {
        // -----------------------------------------
        // 1) Verificar si ya existe un reverso
        // -----------------------------------------
        if (reversoRepository.existsByIdTransaccion(idTransaccion)) {
            return ResponseEntity
                    .badRequest()
                    .body("Esta transacción ya fue reversada anteriormente.");
        }

        // -----------------------------------------
        // 2) Buscar el Pago asociado a la transacción
        // -----------------------------------------
        Optional<Pago> pagoOpt = pagoRepository.findByTransaccion_IdTransaccion(idTransaccion);
        if (pagoOpt.isEmpty()) {
            return ResponseEntity
                    .badRequest()
                    .body("No se encontró el registro de pago para esta transacción.");
        }

        Pago pago = pagoOpt.get();

        // -----------------------------------------
        // 3) Obtener la cuenta asociada al pago
        //    (Pago -> Transaccion -> Tarjeta -> Cuenta)
        // -----------------------------------------
        if (pago.getTransaccion() == null ||
            pago.getTransaccion().getTarjeta() == null ||
            pago.getTransaccion().getTarjeta().getCuenta() == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Error: No se pudo localizar la cuenta asociada a la transacción.");
        }

        Cuenta cuenta = pago.getTransaccion().getTarjeta().getCuenta();

        // -----------------------------------------
        // 4) OBTENER TIPO DE MONEDA (Cuenta vs Pago)
        //    Cuenta: Integer catalogo_tipo_cuenta_idTipoCuenta (1 = CRC, 2 = USD)
        //    Pago:   TipoMoneda tipoMoneda (idTipoMoneda)
        // -----------------------------------------
        Integer idMonedaCuenta = cuenta.getCatalogo_tipo_cuenta_idTipoCuenta();
        if (idMonedaCuenta == null) {
            return ResponseEntity
                    .badRequest()
                    .body("La cuenta no tiene un tipo de moneda definido.");
        }

        if (pago.getTipoMoneda() == null || pago.getTipoMoneda().getIdTipoMoneda() == null) {
            return ResponseEntity
                    .badRequest()
                    .body("El pago no tiene un tipo de moneda definido.");
        }

        int idMonedaPago = pago.getTipoMoneda().getIdTipoMoneda();

        BigDecimal montoOriginal = pago.getMonto(); // monto en la moneda del pago
        BigDecimal montoADevolver;

        // -----------------------------------------
        // 5) LÓGICA DE CONVERSIÓN
        //    1 USD = 500 CRC
        // -----------------------------------------
        if (idMonedaCuenta == idMonedaPago) {
            // Misma moneda → se devuelve exactamente lo pagado
            montoADevolver = montoOriginal;

        } else if (idMonedaPago == MONEDA_DOLARES && idMonedaCuenta == MONEDA_COLONES) {
            // Pago en USD → Cuenta en CRC
            montoADevolver = montoOriginal.multiply(TIPO_CAMBIO_USD_CRC);

        } else if (idMonedaPago == MONEDA_COLONES && idMonedaCuenta == MONEDA_DOLARES) {
            // Pago en CRC → Cuenta en USD
            montoADevolver = montoOriginal.divide(TIPO_CAMBIO_USD_CRC, 2, RoundingMode.HALF_UP);

        } else {
            return ResponseEntity
                    .badRequest()
                    .body("Tipo de moneda no soportado para esta reversión.");
        }

        // -----------------------------------------
        // 6) Actualizar saldo de la cuenta
        // -----------------------------------------
        cuenta.setSaldo(cuenta.getSaldo().add(montoADevolver));
        cuentaRepository.save(cuenta);

        // -----------------------------------------
        // 7) Registrar reverso en ReversoDevolucion
        // -----------------------------------------
        ReversoDevolucion reverso = new ReversoDevolucion();
        reverso.setIdTransaccion(idTransaccion);
        reverso.setMotivo("Reverso aplicado desde módulo Reversos.");
        reverso.setFechaReverso(LocalDateTime.now());
        reversoRepository.save(reverso);

        // -----------------------------------------
        // 8) Obtener o crear ReporteTransaccion
        // -----------------------------------------
        Transaccion transaccion = pago.getTransaccion();

        ReporteTransaccion reporte = reporteTransaccionRepository
                .findByTransaccion_IdTransaccion(idTransaccion)
                .orElseGet(() -> {
                    ReporteTransaccion nuevo = new ReporteTransaccion();
                    nuevo.setTransaccion(transaccion);
                    nuevo.setFechaGenerado(LocalDateTime.now());
                    nuevo.setComentario("Reporte generado automáticamente por reverso de transacción.");
                    return reporteTransaccionRepository.save(nuevo);
                });

        // -----------------------------------------
        // 9) Registrar en Bitácora
        // -----------------------------------------
        Usuario usuario = cuenta.getUsuario(); 

        Bitacora bitacora = new Bitacora();
        bitacora.setModulo("Reversos");
        bitacora.setAccion(
                "Se reversó la transacción #" + idTransaccion
        );
        bitacora.setFecha(LocalDateTime.now());
        bitacora.setReporteTransaccion(reporte);
        bitacora.setUsuario(usuario);

        bitacoraRepository.save(bitacora);

        // -----------------------------------------
        // 10) Respuesta final
        // -----------------------------------------
        return ResponseEntity.ok()
                .body("{\"message\": \"Reverso exitoso. Fondos devueltos en la divisa correcta y registrado en bitácora.\"}");

    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al procesar reverso: " + e.getMessage());
    }
}
}