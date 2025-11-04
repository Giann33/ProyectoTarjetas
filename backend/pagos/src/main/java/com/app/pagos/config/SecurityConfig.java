package com.app.pagos.config;


import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
      .csrf(csrf -> csrf.disable())
      .cors(Customizer.withDefaults()) // usa el bean corsConfigurationSource()
      .authorizeHttpRequests(auth -> auth
        // permite TODOS los preflights
        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
        // abre tus APIs (ajusta si alguna debe requerir auth)
        .requestMatchers("/api/**").permitAll()
        // lo demás, también abierto por ahora
        .anyRequest().permitAll()
      )
      // quita el desafío Basic para que no te devuelva 401 por defecto
      .httpBasic(httpBasic -> httpBasic.disable())
      .formLogin(form -> form.disable());
    return http.build();
  }

  @Bean
  CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration c = new CorsConfiguration();
    // patrones flexibles para 127.0.0.1/localhost y cualquier puerto (Live Server, Vite, etc.)
    c.setAllowedOriginPatterns(List.of("http://127.0.0.1:*", "http://localhost:*"));
    c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
    c.setAllowedHeaders(List.of("*"));
    c.setAllowCredentials(true);
    c.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", c);
    return source;
  }
}