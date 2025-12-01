package com.app.pagos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.app.pagos.entity.Transaccion;

public interface TransaccionRepository extends JpaRepository<Transaccion, Integer> {

        @Query("""
        SELECT t
        FROM Transaccion t
        JOIN t.tarjeta tar
        JOIN tar.cuenta c
        JOIN c.usuario u
        WHERE u.idUsuario = :idUsuario
    """)
    List<Transaccion> findByIdUsuario(@Param("idUsuario") Integer idUsuario);
    
}