package com.app.pagos.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.app.pagos.entity.ReporteTransaccion;

public interface ReporteTransaccionRepository extends JpaRepository<ReporteTransaccion, Integer> {

     Optional<ReporteTransaccion> findByTransaccion_IdTransaccion(Integer idTransaccion);
}