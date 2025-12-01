package com.app.pagos.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.pagos.dto.TransaccionRequest;
import com.app.pagos.service.TransaccionService;

@RestController
@RequestMapping("/api/transacciones")
@CrossOrigin(origins = "*") // Permite que tu JS llame a este backend
public class TransaccionController {

    @Autowired
    private TransaccionService transaccionService;

    @PostMapping("/realizar")
    public ResponseEntity<?> realizarTransaccion(@RequestBody TransaccionRequest request) {
        try {
            transaccionService.procesarPago(request);
            return ResponseEntity.ok("Transacción exitosa");
        } catch (Exception e) {
            // Retorna error 400 con el mensaje (ej: "Fondos insuficientes")
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/consultar")
    public ResponseEntity<?> consultarTransacciones(@RequestParam Integer idUsuario) {
        return ResponseEntity.ok(transaccionService.consultarTransacciones(idUsuario));
    }

}