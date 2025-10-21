package com.app.pagos.repository;

import com.app.pagos.entity.Comercio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComercioRepository extends JpaRepository<Comercio, Long> { }