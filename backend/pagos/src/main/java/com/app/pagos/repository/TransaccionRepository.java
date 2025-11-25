package com.app.pagos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.pagos.entity.Transaccion;

public interface TransaccionRepository extends JpaRepository<Transaccion, Integer> {
}