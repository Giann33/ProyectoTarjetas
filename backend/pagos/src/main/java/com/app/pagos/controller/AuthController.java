package com.app.pagos.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.pagos.dto.LoginResponse;
import com.app.service.AuthService;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

// Si tu front corre en 3000, habilita CORS (opcional)
@CrossOrigin(origins = "http://localhost:3000")

record LoginRequest(@Email String correo, @NotBlank String password) {
}

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
      return ResponseEntity.status(401).body(ex.getMessage());
    }
  }
}
