package com.app.pagos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.app.pagos.entity.Rol;

@Repository
public interface RolRepository extends JpaRepository<Rol, Integer> {
    // JpaRepository ya trae findById por defecto, no necesitas agregar nada más.
}