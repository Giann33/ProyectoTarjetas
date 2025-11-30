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
@CrossOrigin(origins = "*") // Permite que el HTML lea los datos
public class TarjetaController {

    @Autowired
    private TarjetaRepository tarjetaRepository;

     @Autowired
    private TarjetaService tarjetaService;

    @Autowired
private CuentaRepository cuentaRepository;

    @GetMapping("/por-usuario/{idUsuario}")
    public List<TarjetaView> obtenerTarjetasPorUsuario(@PathVariable Integer idUsuario) {
        return tarjetaService.obtenerTarjetasPorUsuario(idUsuario);
    }

    // 1. LISTAR (Para Consultar_Tarjetas.html y Eliminar_Tarjetas.html)
    
@GetMapping
public List<TarjetaViewConsulta> listar() {
    return tarjetaService.listarTodas();
}
    

    // 2. GUARDAR (Para Agregar_Tarjeta.html)
    @PostMapping
public ResponseEntity<?> guardar(@RequestBody CrearTarjetaRequest req) {
    try {
        Tarjeta tarjeta = new Tarjeta();

        tarjeta.setNumeroTarjeta(req.getNumeroTarjeta());
        tarjeta.setFechaExpiracion(req.getFechaExpiracion());
        tarjeta.setCvv(req.getCvv());
        tarjeta.setPin(req.getPin());
        tarjeta.setIdEmisor(req.getIdEmisor());
        tarjeta.setIdTipoTarjeta(req.getIdTipoTarjeta());
        tarjeta.setActivo(1);  // nueva tarjeta siempre activa

        // Asignar la cuenta
        Cuenta cuenta = cuentaRepository.findById(req.getIdCuenta())
                .orElseThrow(() -> new RuntimeException(
                        "No existe la cuenta con id " + req.getIdCuenta()));
        tarjeta.setCuenta(cuenta);

        Tarjeta guardada = tarjetaRepository.save(tarjeta);

        // 🔹 devolvemos un DTO, no la entidad
        TarjetaViewConsulta view = TarjetaViewConsulta.from(guardada);
        return ResponseEntity.ok(view);

    } catch (Exception e) {
        return ResponseEntity.status(500)
                .body("Error al guardar: " + e.getMessage());
    }
}


    // 3. ELIMINAR (Corregido)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            // CORRECCIÓN: Quitamos "Long.valueOf" y pasamos "id" directo
            if (!tarjetaRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            tarjetaRepository.deleteById(id);

            return ResponseEntity.ok().body("{\"message\": \"Tarjeta eliminada\"}");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al eliminar: " + e.getMessage());
        }
    }

    // 4. ACTUALIZAR (Para Editar_Tarjeta.html)
    @PutMapping("/{id}")
    public ResponseEntity<TarjetaViewConsulta> actualizar(
            @PathVariable Integer id,
            @RequestBody EditarTarjetaRequest req) {

        TarjetaViewConsulta view = tarjetaService.actualizarTarjeta(id, req);
        return ResponseEntity.ok(view);
    }
}