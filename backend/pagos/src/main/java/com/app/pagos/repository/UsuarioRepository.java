package com.app.pagos.repository;


import com.app.pagos.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    // property traversal: Usuario -> persona.correo
    Optional<Usuario> findByPersona_Correo(String correo);
}