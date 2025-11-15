package com.app.pagos.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;

import com.app.pagos.dto.CrearCuentaRequest;
import com.app.pagos.entity.Cuenta;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.app.pagos.dto.ActualizarCuentaRequest;
import com.app.pagos.dto.CuentaView;
import com.app.pagos.service.CuentaService;

@RestController
@RequestMapping("/api/cuentas")
@CrossOrigin(origins = { "http://127.0.0.1:5500", "http://localhost:3000" })
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
    /*
     * @GetMapping("/existe/{numeroCuenta}")
     * public ResponseEntity<Boolean> existe(@PathVariable String numeroCuenta) {
     * return ResponseEntity.ok(service.existePorNumero(numeroCuenta));
     * }
     */

    @PutMapping("/{numeroCuentaOriginal}")
    public ResponseEntity<Void> actualizarCuenta(
            @PathVariable String numeroCuentaOriginal,
            @RequestBody ActualizarCuentaRequest request) {
        service.actualizarCuenta(numeroCuentaOriginal, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<Cuenta> crearCuenta(@RequestBody CrearCuentaRequest request) {
        Cuenta nueva = service.crearCuenta(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
    }

    @DeleteMapping("/{numeroCuenta}")
    public ResponseEntity<Void> eliminarCuenta(@PathVariable String numeroCuenta) {
        service.eliminarCuentaPorNumero(numeroCuenta);
        return ResponseEntity.noContent().build();
    }

}
