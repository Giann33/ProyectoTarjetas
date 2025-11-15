
package com.app.pagos.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.app.pagos.entity.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    // Carga usuario + persona en una sola consulta
    @Query("""
           select u 
           from Usuario u 
           join fetch u.persona p 
           where u.idUsuario = :id
           """)
    Optional<Usuario> findByIdUsuario(@Param("id") Integer id);

    Optional<Usuario> findByPersonaIdPersona(Integer personaId);
}