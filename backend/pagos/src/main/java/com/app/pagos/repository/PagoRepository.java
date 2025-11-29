package com.app.pagos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.pagos.entity.Pago;

public interface PagoRepository extends JpaRepository<Pago, Integer> {
}

