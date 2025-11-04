package com.app.pagos.service;

import java.util.Optional;

// UsuarioService.java
import org.springframework.stereotype.Service;

import com.app.pagos.entity.Usuario;
import com.app.pagos.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository repo;

    public UsuarioService(UsuarioRepository repo) {
        this.repo = repo;
    }

    public Optional<Usuario> consultarPorId(int idUsuario) {
        return repo.findById(idUsuario); // <- aquí
    }
}
