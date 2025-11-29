package com.app.pagos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.app.pagos.entity.Bitacora;

public interface BitacoraRepository extends JpaRepository<Bitacora, Integer> {}
