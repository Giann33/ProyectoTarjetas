package com.app.pagos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.pagos.entity.TipoMoneda;

public interface TipoMonedaRepository extends JpaRepository<TipoMoneda, Integer> {}