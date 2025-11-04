// src/main/java/com/app/pagos/dto/LoginResponse.java
package com.app.pagos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private Integer idUsuario;
    private String nombre;
    private String correo;
    private String status; // o "rol" si prefieres
}
