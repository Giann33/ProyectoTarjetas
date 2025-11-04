package com.app.pagos.controller;


import com.app.pagos.dto.LoginResponse;
import com.app.pagos.service.AuthService;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

record LoginRequest(@Email String correo, @NotBlank String password) {}

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