package com.app.pagos.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.pagos.dto.TransaccionViewConsulta;
import com.app.pagos.entity.Cuenta;
import com.app.pagos.entity.Pago;
import com.app.pagos.entity.ReversoDevolucion;
import com.app.pagos.entity.Transaccion;
import com.app.pagos.repository.CuentaRepository; // Importar
import com.app.pagos.repository.PagoRepository;
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
    @Transactional // Importante: Si falla algo, no se guarda nada (rollback)
    public ResponseEntity<?> crearReverso(@PathVariable Integer idTransaccion) {
        try {
            // A. Verificamos si ya existe el reverso
            if (reversoRepository.existsByIdTransaccion(idTransaccion)) {
                return ResponseEntity.badRequest().body("Esta transacción ya fue reversada anteriormente.");
            }

            // B. Buscamos el Pago original para saber cuánto devolver
            Optional<Pago> pagoOpt = pagoRepository.findByTransaccion_IdTransaccion(idTransaccion);

            if (pagoOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("No se encontró el registro de pago para esta transacción.");
            }

            Pago pago = pagoOpt.get();

            // C. Obtenemos la Cuenta del usuario
            // Ruta: Pago -> Transaccion -> Tarjeta -> Cuenta
            if (pago.getTransaccion() == null ||
                    pago.getTransaccion().getTarjeta() == null ||
                    pago.getTransaccion().getTarjeta().getCuenta() == null) {
                return ResponseEntity.badRequest().body("Error: No se pudo localizar la cuenta asociada.");
            }

            Cuenta cuenta = pago.getTransaccion().getTarjeta().getCuenta();

            // D. DEVOLVEMOS EL DINERO (Lógica Matemática)
            // Saldo Nuevo = Saldo Actual + Monto del Pago
            cuenta.setSaldo(cuenta.getSaldo().add(pago.getMonto()));

            // E. Guardamos la cuenta con el nuevo saldo
            cuentaRepository.save(cuenta);

            // F. Registramos el Reverso en el historial
            ReversoDevolucion reverso = new ReversoDevolucion();
            reverso.setIdTransaccion(idTransaccion);
            reverso.setMotivo("Duplicidad detectada y reembolsada");
            reverso.setFechaReverso(LocalDateTime.now());
            reversoRepository.save(reverso);

            return ResponseEntity.ok().body("{\"message\": \"Reverso exitoso. Fondos devueltos a la cuenta.\"}");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al procesar reverso: " + e.getMessage());
        }
    }
}