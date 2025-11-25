package com.app.pagos.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.pagos.entity.Tarjeta;
import com.app.pagos.repository.TarjetaRepository;

@RestController
@RequestMapping("/api/tarjetas")
@CrossOrigin(origins = "*") // Importante para que tu HTML pueda leer los datos
public class TarjetaController {

    @Autowired
    private TarjetaRepository tarjetaRepository;

    // Endpoint: GET http://localhost:8080/api/tarjetas/usuario/{id}
    @GetMapping("/usuario/{idUsuario}")
    public List<Tarjeta> obtenerTarjetasPorUsuario(@PathVariable Integer idUsuario) {

        // 1. Traemos todas las tarjetas
        List<Tarjeta> todasLasTarjetas = tarjetaRepository.findAll();

        // 2. Filtramos solo las que pertenecen al usuario que nos piden
        // (Tarjeta -> Cuenta -> Usuario)
        return todasLasTarjetas.stream()
                .filter(tarjeta -> tarjeta.getCuenta() != null
                        && tarjeta.getCuenta().getUsuario().equals(idUsuario))
                .collect(Collectors.toList());
    }
}