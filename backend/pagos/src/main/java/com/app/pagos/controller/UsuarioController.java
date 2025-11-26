package com.app.pagos.controller;

import com.app.pagos.dto.CrearUsuarioRequest;
import com.app.pagos.dto.EditarUsuarioRequest;
import com.app.pagos.dto.UsuarioView;
import com.app.pagos.repository.UsuarioRepository;
import com.app.pagos.service.UsuarioService;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

private final UsuarioService usuarioService;
    
    private final UsuarioRepository usuarioRepository;
    
    @Autowired
    public UsuarioController(UsuarioRepository usuarioRepository, UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
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

    // PUT /api/usuarios/{id}
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioView> actualizarUsuario(
            @PathVariable("id") Integer id,
            @RequestBody EditarUsuarioRequest dto) {

        UsuarioView actualizado = usuarioService.actualizarUsuario(id, dto);
        return ResponseEntity.ok(actualizado);
    }

     @PostMapping
    public ResponseEntity<UsuarioView> crearUsuario(@RequestBody CrearUsuarioRequest dto) {
        UsuarioView creado = usuarioService.crearUsuario(dto);
        return ResponseEntity.ok(creado);
    }

 @DeleteMapping("/{idUsuario}")
public ResponseEntity<Void> eliminarUsuario(@PathVariable Integer idUsuario) {
    try {
        usuarioService.eliminarUsuario(idUsuario);
        return ResponseEntity.noContent().build();  // 204
    } catch (RuntimeException ex) {
        return ResponseEntity.notFound().build();   // 404 si el usuario no existe
    }
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

