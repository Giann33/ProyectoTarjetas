package com.app.pagos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.pagos.entity.Tarjeta;

public interface TarjetaRepository extends JpaRepository<Tarjeta, Integer> {
}