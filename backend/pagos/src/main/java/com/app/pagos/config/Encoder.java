package com.app.pagos.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;



import lombok.RequiredArgsConstructor;

// Esta clase es temporal
@Component
@RequiredArgsConstructor
class Encoder implements CommandLineRunner {
  private final org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder;

  @Override public void run(String... args) {
    System.out.println("HASH 1234 => " + encoder.encode("1234"));
  }
}