package com.app.pagos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.app.pagos.entity.EstadoTransaccion;

public interface EstadoTransaccionRepository extends JpaRepository<EstadoTransaccion, Integer> {
}
