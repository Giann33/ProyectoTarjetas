package com.app.pagos.service;

import com.app.pagos.dto.CuentaView;
import com.app.pagos.repository.CuentaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CuentaService {

    private final CuentaRepository repo;

    public CuentaService(CuentaRepository repo) {
        this.repo = repo;
    }

    public List<CuentaView> consultarPorIdPersona(int idPersona) {
        return repo.findByIdPersona(idPersona);
    }

    public List<CuentaView> consultarPorNumero(String numeroCuenta) {
        if (numeroCuenta == null || numeroCuenta.isBlank()) {
            return List.of();
        }
        return repo.findByNumeroCuenta(numeroCuenta.trim());
    }
}
