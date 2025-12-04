package com.app.pagos.repository;

import java.util.Optional; // Importar esto

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.app.pagos.entity.Pago;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Integer> {

    // --- AGREGA ESTE MÉTODO ---
    // Busca el pago asociado a una transacción específica
    Optional<Pago> findByTransaccion_IdTransaccion(Integer idTransaccion);

}