package com.app.pagos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.app.pagos.entity.Tarjeta;

@Repository
public interface TarjetaRepository extends JpaRepository<Tarjeta, Integer> {

    // Buscar tarjetas asociadas a un usuario específico
    // (Tarjeta -> Cuenta -> Usuario)
    @Query("SELECT t FROM Tarjeta t WHERE t.cuenta.usuario.idUsuario = :idUsuario")
    List<Tarjeta> findByUsuarioId(@Param("idUsuario") Integer idUsuario);

}