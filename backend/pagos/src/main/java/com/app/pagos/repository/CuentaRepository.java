package com.app.pagos.repository;

import com.app.pagos.dto.CuentaView;
import com.app.pagos.entity.Cuenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CuentaRepository extends JpaRepository<Cuenta, String> {

    @Query("""
        select c.numeroCuenta as numeroCuenta,
               c.Usuario.idUsuario as idUsuario,
               c.catalogo_tipo_cuenta_idTipoCuenta as idTipoCuenta,
               c.saldo as saldo,
               c.catalogo_tipo_moneda_idTipoMoneda as idTipoMoneda
        from Cuenta c
        where c.Usuario.idUsuario = :idUsuario
    """)
    List<CuentaView> findByIdUsuario(int idUsuario);

    @Query("""
        select c.numeroCuenta as numeroCuenta,
               c.Usuario.idUsuario as idUsuario,
               c.catalogo_tipo_cuenta_idTipoCuenta as idTipoCuenta,
               c.saldo as saldo,
               c.catalogo_tipo_moneda_idTipoMoneda as idTipoMoneda
        from Cuenta c
        where upper(c.numeroCuenta) = upper(:numeroCuenta)
    """)
    List<CuentaView> findByNumeroCuenta(String numeroCuenta);
}

