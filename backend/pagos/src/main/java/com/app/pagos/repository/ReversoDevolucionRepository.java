package com.app.pagos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.app.pagos.entity.ReversoDevolucion;

@Repository
public interface ReversoDevolucionRepository extends JpaRepository<ReversoDevolucion, Integer> {

    // Método mágico de Spring: Busca si existe un registro con ese idTransaccion
    boolean existsByIdTransaccion(Integer idTransaccion);

}