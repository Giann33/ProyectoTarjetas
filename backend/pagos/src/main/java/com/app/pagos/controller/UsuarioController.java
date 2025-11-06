package com.app.pagos.controller;

import com.app.pagos.dto.UsuarioView;
import com.app.pagos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

     @GetMapping("/{id}")
    public ResponseEntity<UsuarioView> getById(@PathVariable Integer id) {
        return usuarioRepository
                .findByIdUsuario(id)                // usa el built-in de JpaRepository
                .map(UsuarioView::from)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}

    // GET /api/usuarios/correo?correo=alguien@dominio.com
    /*
     * @GetMapping("/correo")
     * public ResponseEntity<List<UsuarioView>> consultarPorCorreo(
     * 
     * @RequestParam @Email String correo) {
     * 
     * List<UsuarioView> usuarios = service.consultarPorCorreo(correo);
     * return usuarios.isEmpty()
     * ? ResponseEntity.noContent().build()
     * : ResponseEntity.ok(usuarios);
     * }
     */

