package com.app.pagos.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.app.pagos.dto.CuentaView;
import com.app.pagos.entity.Cuenta;

public interface CuentaRepository extends JpaRepository<Cuenta, Integer> {

  @Query(value = """
      SELECT
        c.numeroCuenta                                   AS numeroCuenta,
        c.Usuario_idUsuario                              AS idCliente,
        c.catalogo_tipo_cuenta_idTipoCuenta              AS idTipoCuenta,
        c.estado                                         AS estado,
        c.saldo                                          AS saldo,
        c.catalogo_tipo_moneda_idTipoMoneda              AS idTipoMoneda,
        c.Sucursal_idSucursal                            AS sucursal
      FROM sistemapagotarjeta.cuenta c
      WHERE UPPER(c.numeroCuenta) = UPPER(:numeroCuenta)
      """, nativeQuery = true)
  List<CuentaView> findByNumeroCuenta(@Param("numeroCuenta") String numeroCuenta);

  @Query(value = """
      SELECT
        c.numeroCuenta                                   AS numeroCuenta,
        c.Usuario_idUsuario                              AS idCliente,
        c.catalogo_tipo_cuenta_idTipoCuenta              AS idTipoCuenta,
        c.estado                                         AS estado,
        c.saldo                                          AS saldo,
        c.catalogo_tipo_moneda_idTipoMoneda              AS idTipoMoneda,
        c.Sucursal_idSucursal                            AS sucursal
      FROM sistemapagotarjeta.cuenta c
      WHERE c.Usuario_idUsuario  = :idUsuario
      """, nativeQuery = true)
  List<CuentaView> findByIdUsuario(@Param("idUsuario") Integer idUsuario);

  @Query("SELECT c FROM Cuenta c WHERE c.numeroCuenta = :numeroCuenta")
  Optional<Cuenta> findByNumero(@Param("numeroCuenta") String numeroCuenta);        // ESTE ES PARA ACTUALIZAR

  boolean existsByNumeroCuenta(String numeroCuenta);
}
