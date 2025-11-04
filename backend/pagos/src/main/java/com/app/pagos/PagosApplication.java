package com.app.pagos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.app") // <- escanea com.app.*
public class PagosApplication {
	public static void main(String[] args) {
		SpringApplication.run(PagosApplication.class, args);
	}
}
