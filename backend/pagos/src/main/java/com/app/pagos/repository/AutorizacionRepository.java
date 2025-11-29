package com.app.pagos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.app.pagos.entity.Autorizacion;

public interface AutorizacionRepository extends JpaRepository<Autorizacion, Integer> {
}