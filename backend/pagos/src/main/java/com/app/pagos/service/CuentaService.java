package com.app.pagos.service;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;

import com.app.pagos.dto.ActualizarCuentaRequest;
import com.app.pagos.dto.CuentaView;
import com.app.pagos.entity.Cuenta;
import com.app.pagos.entity.Usuario;
import com.app.pagos.repository.CuentaRepository;
import com.app.pagos.dto.CrearCuentaRequest;
import com.app.pagos.repository.UsuarioRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class CuentaService {

    private final CuentaRepository repo;
    private final UsuarioRepository usuarioRepository;

     public CuentaService(CuentaRepository repo, UsuarioRepository usuarioRepository) {
        this.repo = repo;
        this.usuarioRepository = usuarioRepository;
    }

    public List<CuentaView> consultarPorIdUsuario(int idUsuario) {
        return repo.findByIdUsuario(idUsuario);
    }

    public List<CuentaView> consultarPorNumero(String numeroCuenta) {
        if (numeroCuenta == null || numeroCuenta.isBlank()) {
            return Collections.emptyList();
        }
        return repo.findByNumeroCuenta(numeroCuenta.trim());
    }

    /*
     * public boolean existePorNumero(String numeroCuenta) {
     * if (numeroCuenta == null)
     * return false;
     * String trimmed = numeroCuenta.trim();
     * if (trimmed.isEmpty())
     * return false;
     * 
     * try {
     * Integer num = Integer.valueOf(trimmed);
     * return repo.existsByNumeroCuenta(num);
     * } catch (NumberFormatException ex) {
     * // No es un número válido
     * return false;
     * }
     * }
     */

    public void actualizarCuenta(String numeroCuentaOriginal,
            ActualizarCuentaRequest data) {

        // 1) Buscar la cuenta por su numeroCuenta visible
        Cuenta cuenta = repo.findByNumero(numeroCuentaOriginal)
                .orElseThrow(() -> new EntityNotFoundException("Cuenta no encontrada"));

        // 2) Actualizar numeroCuenta (YA NO es PK, se puede cambiar)
        if (data.numeroCuentaNuevo() != null &&
                !data.numeroCuentaNuevo().isBlank()) {
            cuenta.setNumeroCuenta(data.numeroCuentaNuevo());
        }

        // 3) Resto de campos editables
        if (data.idTipoCuenta() != null) {
            cuenta.setCatalogo_tipo_cuenta_idTipoCuenta(data.idTipoCuenta());
        }

        if (data.idTipoMoneda() != null) {
            cuenta.setCatalogo_tipo_moneda_idTipoMoneda(data.idTipoMoneda());
        }

        if (data.sucursal() != null) {
            cuenta.setSucursal(data.sucursal());
        }

        if (data.idUsuario() != null) {

    Usuario usuario = usuarioRepository.findById(data.idUsuario())
            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

    cuenta.setUsuario(usuario);
}

        // 4) Guardar
        repo.save(cuenta);
    }

    public Cuenta crearCuenta(CrearCuentaRequest data) {

        if (data.numeroCuenta() == null || data.numeroCuenta().isBlank()) {
            throw new IllegalArgumentException("El número de cuenta es obligatorio");
        }
        if (data.idUsuario() == null) {
            throw new IllegalArgumentException("El idUsuario es obligatorio");
        }
        if (data.tipoCuenta() == null || data.tipoMoneda() == null || data.sucursal() == null) {
            throw new IllegalArgumentException("Tipo de cuenta, moneda y sucursal son obligatorios");
        }

        // Validar que no exista otra cuenta con el mismo número
        if (repo.existsByNumeroCuenta(data.numeroCuenta())) {
            throw new IllegalArgumentException("Ya existe una cuenta con ese número");
        }

        Cuenta cuenta = new Cuenta();

        // Estos setters existen porque ya se usan en actualizarCuenta
        cuenta.setNumeroCuenta(data.numeroCuenta());
        // 1) Buscar el usuario por ID
Usuario usuario = usuarioRepository.findById(data.idUsuario())
        .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

// 2) Asignar la entidad Usuario a la cuenta
cuenta.setUsuario(usuario);
        cuenta.setCatalogo_tipo_cuenta_idTipoCuenta(data.tipoCuenta());
        cuenta.setCatalogo_tipo_moneda_idTipoMoneda(data.tipoMoneda());
        cuenta.setSucursal(data.sucursal());

        BigDecimal saldo = data.saldo() != null ? data.saldo() : BigDecimal.ZERO;
        cuenta.setSaldo(saldo);

        return repo.save(cuenta);
    }

    public void eliminarCuentaPorNumero(String numeroCuenta) {
    if (numeroCuenta == null || numeroCuenta.isBlank()) {
        throw new IllegalArgumentException("El número de cuenta es obligatorio");
    }

    Cuenta cuenta = repo.findByNumero(numeroCuenta)
            .orElseThrow(() -> new IllegalArgumentException("No existe una cuenta con ese número"));

    repo.delete(cuenta);
}


}
