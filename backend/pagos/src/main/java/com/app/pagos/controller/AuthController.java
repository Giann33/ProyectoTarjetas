package com.app.pagos.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.pagos.dto.LoginResponse;
import com.app.pagos.dto.RegisterRequest; // <--- IMPORTANTE: Importar el DTO
import com.app.pagos.entity.Usuario;
import com.app.pagos.service.AuthService;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

// DTO interno para Login (puedes dejarlo aquí o sacarlo a otro archivo)
record LoginRequest(@Email String correo, @NotBlank String password) {
}

@CrossOrigin(origins = "*") // Permite peticiones desde cualquier Frontend
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequest req) {
    try {
      LoginResponse res = authService.login(req.correo(), req.password());
      return ResponseEntity.ok(res);
    } catch (RuntimeException ex) {
      // 401 Unauthorized si falla el login
      return ResponseEntity.status(401).body(ex.getMessage());
    }
  }

  // --- ESTE ES EL MÉTODO QUE CONECTA CON TU NUEVO SERVICIO ---
  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
    try {
      // Llama a tu método 'registrar' en AuthService
      Usuario nuevoUsuario = authService.registrar(req);
      return ResponseEntity.ok(nuevoUsuario);
    } catch (RuntimeException ex) {
      // 400 Bad Request si el correo ya existe o falla algo
      return ResponseEntity.badRequest().body(ex.getMessage());
    }
  }
}