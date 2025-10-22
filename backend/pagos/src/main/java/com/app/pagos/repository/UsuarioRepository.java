package com.app.pagos.repository;

import com.app.pagos.dto.UsuarioView;
import com.app.pagos.entity.Persona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UsuarioRepository extends JpaRepository<Persona, Integer> {

    @Query("""
        select p.id as idPersona,
               p.nombre as nombre,
               p.correo as correo
        from Persona p
        where p.id = :idPersona
    """)
    List<UsuarioView> findByIdPersona(int idPersona);

    @Query("""
        select p.id as idPersona,
               p.nombre as nombre,
               p.correo as correo
        from Persona p
        where upper(p.correo) = upper(:correo)
    """)
    List<UsuarioView> findByCorreo(String correo);
}
