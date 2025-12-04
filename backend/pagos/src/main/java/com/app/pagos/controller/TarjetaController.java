package com.app.pagos.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.pagos.dto.CrearTarjetaRequest;
import com.app.pagos.dto.EditarTarjetaRequest;
import com.app.pagos.dto.TarjetaView;
import com.app.pagos.dto.TarjetaViewConsulta;
import com.app.pagos.entity.Cuenta;
import com.app.pagos.entity.Tarjeta;
import com.app.pagos.repository.CuentaRepository;
import com.app.pagos.repository.TarjetaRepository;
import com.app.pagos.service.TarjetaService;

@RestController
@RequestMapping("/api/tarjetas")
@CrossOrigin(origins = "*")
public class TarjetaController {

    @Autowired
    private TarjetaRepository tarjetaRepository;
    @Autowired
    private CuentaRepository cuentaRepository;
    @Autowired
    private TarjetaService tarjetaService;

    @GetMapping
    public List<TarjetaViewConsulta> listar() {
        return tarjetaService.listarTodas();
    }

    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody CrearTarjetaRequest req) {
        try {
            Tarjeta tarjeta = new Tarjeta();
            tarjeta.setNumeroTarjeta(req.getNumeroTarjeta());

            // --- CAMBIO: Guardamos el String directo (ej: "12/28") ---
            tarjeta.setFechaExpiracion(req.getFechaExpiracion());
            // ---------------------------------------------------------

            tarjeta.setCvv(req.getCvv());
            tarjeta.setPin(req.getPin());
            tarjeta.setIdEmisor(req.getIdEmisor());
            tarjeta.setIdTipoTarjeta(req.getIdTipoTarjeta());
            tarjeta.setActivo(1);

            if (req.getIdCuenta() != null) {
                Cuenta cuenta = cuentaRepository.findById(req.getIdCuenta())
                        .orElseThrow(() -> new RuntimeException("Cuenta no encontrada"));
                tarjeta.setCuenta(cuenta);
            }

            Tarjeta guardada = tarjetaRepository.save(tarjeta);
            return ResponseEntity.ok(TarjetaViewConsulta.from(guardada));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al guardar: " + e.getMessage());
        }
    }

    
   

    @GetMapping("/por-usuario/{idUsuario}")
    public List<TarjetaView> obtenerTarjetasPorUsuario(@PathVariable Integer idUsuario) {
        return tarjetaService.obtenerTarjetasPorUsuario(idUsuario);
    }

    // 1. LISTAR (Para Consultar_Tarjetas.html y Eliminar_Tarjetas.html)

    // ... Mantén los métodos eliminar y actualizar como estaban, usando el servicio
    // ...

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            if (!tarjetaRepository.existsById(id))
                return ResponseEntity.notFound().build();
            tarjetaRepository.deleteById(id);
            return ResponseEntity.ok().body("{\"message\": \"Tarjeta eliminada\"}");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody EditarTarjetaRequest req) {
        try {
            TarjetaViewConsulta view = tarjetaService.actualizarTarjeta(id, req);
            return ResponseEntity.ok(view);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}