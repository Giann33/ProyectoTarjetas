package com.app.pagos.service;


import com.app.pagos.entity.Usuario;
import com.app.pagos.repository.UsuarioRepository;
import org.springframework.stereotype.Service;


import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository repo;

    public UsuarioService(UsuarioRepository repo) {
        this.repo = repo;
    }

    public Optional<Usuario> consultarPorId(int idUsuario) {
        return repo.findByIdUsuario(idUsuario);
    }

  /*   public List<UsuarioView> consultarPorCorreo(String correo) {
        if (correo == null || correo.isBlank()) {
            return List.of();
        }
        return repo.findByCorreo(correo.trim());
    }  */
}
