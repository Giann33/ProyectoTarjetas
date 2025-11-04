package com.app.pagos.service;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;

import com.app.pagos.dto.CuentaView;
import com.app.pagos.repository.CuentaRepository;

@Service
public class CuentaService {

    private final CuentaRepository repo;

    public CuentaService(CuentaRepository repo) {
        this.repo = repo;
    }

    public List<CuentaView> consultarPorIdUsuario(int idUsuario) {
        return repo.findByIdUsuario(idUsuario);
    }

    public List<CuentaView> consultarPorNumero(String numeroCuenta) {
        if (numeroCuenta == null || numeroCuenta.isBlank()) {
            return Collections.emptyList();
        }
        return repo.findByNumeroCuenta(numeroCuenta.trim());
    }

    public boolean existePorNumero(String numeroCuenta) {
        if (numeroCuenta == null || numeroCuenta.isBlank())
            return false;
        return repo.existsByNumeroCuenta(numeroCuenta.trim());
    }
}
