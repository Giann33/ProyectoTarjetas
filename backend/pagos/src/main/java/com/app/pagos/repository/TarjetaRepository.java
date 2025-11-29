package com.app.pagos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.app.pagos.entity.Tarjeta;

public interface TarjetaRepository extends JpaRepository<Tarjeta, Integer> {


@Query("SELECT t FROM Tarjeta t WHERE t.cuenta.usuario.idUsuario = :idUsuario")
List<Tarjeta> findByUsuarioId(@Param("idUsuario") Integer idUsuario);
}