package com.app.pagos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.app.pagos.entity.Servicio;

public interface ServicioRepository extends JpaRepository<Servicio, Integer> {
}