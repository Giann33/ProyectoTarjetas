package com.app.pagos.repository;

import com.app.pagos.dto.UsuarioView;
import com.app.pagos.entity.Persona;
import com.app.pagos.entity.Usuario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByIdUsuario(int idUsuario);
}