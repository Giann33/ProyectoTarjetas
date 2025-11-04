package com.app.pagos.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.pagos.dto.CuentaView;
import com.app.pagos.service.CuentaService;

@RestController
@RequestMapping("/api/cuentas")
public class CuentaController {

    private final CuentaService service;

    public CuentaController(CuentaService service) {
        this.service = service;
    }

    @GetMapping("/por-numero/{numeroCuenta}")
    public ResponseEntity<List<CuentaView>> porNumero(@PathVariable String numeroCuenta) {
        return ResponseEntity.ok(service.consultarPorNumero(numeroCuenta));
    }

    @GetMapping("/por-usuario/{idUsuario}")
    public ResponseEntity<List<CuentaView>> porUsuario(@PathVariable int idUsuario) {
        return ResponseEntity.ok(service.consultarPorIdUsuario(idUsuario));
    }

    @GetMapping("/existe/{numeroCuenta}")
    public ResponseEntity<Boolean> existe(@PathVariable String numeroCuenta) {
        return ResponseEntity.ok(service.existePorNumero(numeroCuenta));
    }
}
