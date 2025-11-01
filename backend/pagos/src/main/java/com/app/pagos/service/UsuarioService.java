package com.app.pagos.service;

import com.app.pagos.dto.UsuarioView;
import com.app.pagos.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository repo;

    public UsuarioService(UsuarioRepository repo) {
        this.repo = repo;
    }

    public List<UsuarioView> consultarPorId(int idPersona) {
        return repo.findByIdPersona(idPersona);
    }

    public List<UsuarioView> consultarPorCorreo(String correo) {
        if (correo == null || correo.isBlank()) {
            return List.of();
        }
        return repo.findByCorreo(correo.trim());
    }
}
