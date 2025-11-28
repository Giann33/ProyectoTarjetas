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

import com.app.pagos.entity.Tarjeta;
import com.app.pagos.repository.TarjetaRepository;

@RestController
@RequestMapping("/api/tarjetas")
@CrossOrigin(origins = "*") // Permite que el HTML lea los datos
public class TarjetaController {

    @Autowired
    private TarjetaRepository tarjetaRepository;

    // 1. LISTAR (Para Consultar_Tarjetas.html y Eliminar_Tarjetas.html)
    @GetMapping
    public List<Tarjeta> listar() {
        return tarjetaRepository.findAll();
    }

    // 2. GUARDAR (Para Agregar_Tarjeta.html)
    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Tarjeta tarjeta) {
        try {
            tarjeta.setActivo(1); // Siempre activo al crear
            Tarjeta nueva = tarjetaRepository.save(tarjeta);
            return ResponseEntity.ok(nueva);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al guardar: " + e.getMessage());
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
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Tarjeta tarjetaDetalles) {
        try {
            // Buscamos la tarjeta por ID
            Tarjeta tarjeta = tarjetaRepository.findById(id).orElse(null);

            if (tarjeta == null) {
                return ResponseEntity.notFound().build();
            }

            // Actualizamos los datos con lo que nos envíe el formulario
            tarjeta.setNumeroTarjeta(tarjetaDetalles.getNumeroTarjeta());
            tarjeta.setFechaExpiracion(tarjetaDetalles.getFechaExpiracion());
            tarjeta.setCvv(tarjetaDetalles.getCvv());
            tarjeta.setPin(tarjetaDetalles.getPin());
            tarjeta.setIdEmisor(tarjetaDetalles.getIdEmisor());
            tarjeta.setIdTipoTarjeta(tarjetaDetalles.getIdTipoTarjeta());
            tarjeta.setIdCuenta(tarjetaDetalles.getIdCuenta());

            // Guardamos los cambios
            Tarjeta actualizada = tarjetaRepository.save(tarjeta);
            return ResponseEntity.ok(actualizada);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al actualizar: " + e.getMessage());
        }
    }
}