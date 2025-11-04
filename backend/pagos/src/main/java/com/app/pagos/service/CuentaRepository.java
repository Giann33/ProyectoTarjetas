package com.app.pagos.service;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.app.pagos.dto.CuentaView;
import com.app.pagos.entity.Cuenta;

public interface CuentaRepository extends JpaRepository<Cuenta, Integer> {

  @Query(value = """
      SELECT
        c.numeroCuenta                                   AS numeroCuenta,
        c.id_Usuario                                     AS idCliente,
        c.catalogo_tipo_cuenta_idTipoCuenta              AS idTipoCuenta,
        c.estado                                         AS estado,
        c.saldo                                          AS saldo,
        c.catalogo_tipo_moneda_idTipoMoneda              AS idTipoMoneda
      FROM sistemapagotarjeta.cuenta c
      WHERE UPPER(c.numeroCuenta) = UPPER(:numeroCuenta)
      """, nativeQuery = true)
  List<CuentaView> findByNumeroCuenta(@Param("numeroCuenta") String numeroCuenta);

  @Query(value = """
      SELECT
        c.numeroCuenta                                   AS numeroCuenta,
        c.id_Usuario                                     AS idCliente,
        c.catalogo_tipo_cuenta_idTipoCuenta              AS idTipoCuenta,
        c.estado                                         AS estado,
        c.saldo                                          AS saldo,
        c.catalogo_tipo_moneda_idTipoMoneda              AS idTipoMoneda
      FROM sistemapagotarjeta.cuenta c
      WHERE c.id_Usuario = :idUsuario
      """, nativeQuery = true)
  List<CuentaView> findByIdUsuario(@Param("idUsuario") Integer idUsuario);

  boolean existsByNumeroCuenta(String numeroCuenta);
}
