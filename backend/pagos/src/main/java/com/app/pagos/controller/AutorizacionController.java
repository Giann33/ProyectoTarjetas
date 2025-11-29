package com.app.pagos.controller;


import com.app.pagos.dto.AutorizarTransaccionRequest;
import com.app.pagos.dto.AutorizarTransaccionResponse;
import com.app.pagos.service.AutorizacionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transacciones")
public class AutorizacionController {

    @Autowired
    private AutorizacionService autorizacionService;

    @PostMapping("/autorizar")
    public ResponseEntity<?> autorizar(@RequestBody AutorizarTransaccionRequest request) {
        try {
            AutorizarTransaccionResponse response = autorizacionService.autorizar(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            // Errores de datos (IDs inválidos, etc.)
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace(); // IMPORTANTE: esto imprime el stacktrace en la consola de Spring
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno al procesar la autorización");
        }
    }
}