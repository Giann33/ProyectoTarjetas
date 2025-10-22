package com.app.pagos.repository;

import com.app.pagos.dto.CuentaView;
import com.app.pagos.entity.Cuenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CuentaRepository extends JpaRepository<Cuenta, Integer> {

    @Query("""
        select c.id as idCuenta,
               c.persona.id as idPersona,
               c.numero as numeroCuenta,
               c.tipo as tipo,
               c.estado as estado,
               c.saldo as saldo
        from Cuenta c
        where c.persona.id = :idPersona
    """)
    List<CuentaView> findByIdPersona(int idPersona);

    @Query("""
        select c.id as idCuenta,
               c.persona.id as idPersona,
               c.numero as numeroCuenta,
               c.tipo as tipo,
               c.estado as estado,
               c.saldo as saldo
        from Cuenta c
        where upper(c.numero) = upper(:numeroCuenta)
    """)
    List<CuentaView> findByNumeroCuenta(String numeroCuenta);
}

