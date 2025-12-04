package com.app.pagos.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// IMPORTS QUE FALTABAN
import com.app.pagos.dto.TransaccionViewConsulta;
import com.app.pagos.entity.Pago;
import com.app.pagos.entity.ReversoDevolucion;
import com.app.pagos.entity.Transaccion;
import com.app.pagos.repository.PagoRepository;
import com.app.pagos.repository.ReversoDevolucionRepository;

@RestController
@RequestMapping("/api/reversos")
@CrossOrigin(origins = "*")
public class ReversoController {

    @Autowired
    private PagoRepository pagoRepository;

    @Autowired
    private ReversoDevolucionRepository reversoRepository;

    // 1. LISTAR DUPLICADOS (CON ESTADO)
    @GetMapping("/duplicados")
    public ResponseEntity<?> obtenerDuplicados() {
        try {
            List<Pago> todosLosPagos = pagoRepository.findAll();
            List<TransaccionViewConsulta> duplicadasView = new ArrayList<>();

            if (todosLosPagos.isEmpty())
                return ResponseEntity.ok(duplicadasView);

            // Agrupar Pagos
            Map<String, List<Pago>> agrupadas = todosLosPagos.stream()
                    .filter(p -> p.getTransaccion() != null)
                    .collect(Collectors.groupingBy(p -> {
                        Transaccion t = p.getTransaccion();
                        String idTarjeta = (t.getTarjeta() != null) ? t.getTarjeta().getIdTarjeta().toString() : "0";
                        String monto = (p.getMonto() != null) ? p.getMonto().toString() : "0";
                        String destino = (t.getDestino() != null) ? t.getDestino() : "N/A";
                        return idTarjeta + "-" + monto + "-" + destino;
                    }));

            // Procesar duplicados
            for (List<Pago> grupo : agrupadas.values()) {
                if (grupo.size() > 1) {
                    for (Pago pago : grupo) {
                        try {
                            // Convertir a DTO
                            TransaccionViewConsulta dto = TransaccionViewConsulta.from(pago.getTransaccion(), pago);

                            // VERIFICAR SI YA SE HIZO EL REVERSO EN BD
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

    // 2. CREAR REVERSO (CUANDO DAS CLICK AL BOTÓN)
    @PostMapping("/{idTransaccion}")
    public ResponseEntity<?> crearReverso(@PathVariable Integer idTransaccion) {
        try {
            // Verificar si ya existe
            if (reversoRepository.existsByIdTransaccion(idTransaccion)) {
                return ResponseEntity.badRequest().body("Esta transacción ya fue reversada.");
            }

            // Guardar en la tabla reverso_devolucion
            ReversoDevolucion reverso = new ReversoDevolucion();
            reverso.setIdTransaccion(idTransaccion);
            reverso.setMotivo("Duplicidad detectada por usuario");
            reverso.setFechaReverso(LocalDateTime.now());

            reversoRepository.save(reverso);

            return ResponseEntity.ok().body("{\"message\": \"Reverso completado\"}");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al crear reverso: " + e.getMessage());
        }
    }
}