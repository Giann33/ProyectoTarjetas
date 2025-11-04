package com.app.pagos.controller;

//import com.app.pagos.dto.UsuarioView;
import com.app.pagos.entity.Usuario;
import com.app.pagos.service.UsuarioService;
//import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

//import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@Validated
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    // GET /api/usuarios/1
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> consultarPorId(@PathVariable("id") @Min(1) int id) {
        return service.consultarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    // GET /api/usuarios/correo?correo=alguien@dominio.com
  /*  @GetMapping("/correo")
    public ResponseEntity<List<UsuarioView>> consultarPorCorreo(
            @RequestParam @Email String correo) {

        List<UsuarioView> usuarios = service.consultarPorCorreo(correo);
        return usuarios.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(usuarios);
    }   */
}
