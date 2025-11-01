package com.app.pagos.controller;

import com.app.pagos.dto.CuentaView;
import com.app.pagos.service.CuentaService;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cuentas")
@Validated
public class CuentaController {

    private final CuentaService service;

    public CuentaController(CuentaService service) {
        this.service = service;
    }

    // GET /api/cuentas/persona/123
    @GetMapping("/persona/{idPersona}")
    public ResponseEntity<List<CuentaView>> consultarPorIdPersona(
            @PathVariable @Min(1) int idPersona) {

        List<CuentaView> cuentas = service.consultarPorIdPersona(idPersona);
        return cuentas.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(cuentas);
    }

    // GET /api/cuentas/numero?numero=XXXX
    @GetMapping("/numero")
    public ResponseEntity<List<CuentaView>> consultarPorNumero(
            @RequestParam String numero) {

        List<CuentaView> cuentas = service.consultarPorNumero(numero);
        return cuentas.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(cuentas);
    }
}
