package com.app.pagos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.app.pagos.entity.ReporteTransaccion;

public interface ReporteTransaccionRepository extends JpaRepository<ReporteTransaccion, Integer> {}