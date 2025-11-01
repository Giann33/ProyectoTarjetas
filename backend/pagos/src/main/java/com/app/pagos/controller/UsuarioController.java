package com.app.pagos.controller;

import com.app.pagos.dto.UsuarioView;
import com.app.pagos.service.UsuarioService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@Validated
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    // GET /api/usuarios/id/123
    @GetMapping("/id/{idPersona}")
    public ResponseEntity<List<UsuarioView>> consultarPorId(
            @PathVariable @Min(1) int idPersona) {

        List<UsuarioView> usuarios = service.consultarPorId(idPersona);
        return usuarios.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(usuarios);
    }

    // GET /api/usuarios/correo?correo=alguien@dominio.com
    @GetMapping("/correo")
    public ResponseEntity<List<UsuarioView>> consultarPorCorreo(
            @RequestParam @Email String correo) {

        List<UsuarioView> usuarios = service.consultarPorCorreo(correo);
        return usuarios.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(usuarios);
    }
}
