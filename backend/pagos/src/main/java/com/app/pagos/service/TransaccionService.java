package com.app.pagos.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.pagos.dto.TransaccionRequest;
// Importa tus entidades
import com.app.pagos.entity.Cuenta;
import com.app.pagos.entity.Pago;
import com.app.pagos.entity.Tarjeta;
import com.app.pagos.entity.Transaccion;
// Importa tus repositorios
import com.app.pagos.repository.CuentaRepository;
import com.app.pagos.repository.PagoRepository;
import com.app.pagos.repository.TarjetaRepository;
import com.app.pagos.repository.TransaccionRepository;

@Service
public class TransaccionService {

    @Autowired
    private TarjetaRepository tarjetaRepository;
    @Autowired
    private CuentaRepository cuentaRepository;
    @Autowired
    private TransaccionRepository transaccionRepository;
    @Autowired
    private PagoRepository pagoRepository;

    @Transactional // <--- CRÍTICO: Asegura la integridad de los datos
    public void procesarPago(TransaccionRequest request) throws Exception {

        // 1. Buscar la tarjeta
        Tarjeta tarjeta = tarjetaRepository.findById(request.getIdTarjeta())
                .orElseThrow(() -> new Exception("Tarjeta no encontrada"));

        // 2. Obtener la cuenta asociada a esa tarjeta
        // (Nota: Tu entidad Tarjeta debe tener la relación con Cuenta)
        Cuenta cuenta = tarjeta.getCuenta();

        // 3. VALIDAR FONDOS
        // compareTo devuelve -1 si es menor. Si saldo < monto -> Error.
        if (cuenta.getSaldo().compareTo(request.getMonto()) < 0) {
            throw new Exception("Fondos insuficientes en la cuenta");
        }

        // 4. DESCONTAR DINERO (Lógica matemática)
        cuenta.setSaldo(cuenta.getSaldo().subtract(request.getMonto()));
        cuentaRepository.save(cuenta); // Guardamos el nuevo saldo

        // 5. REGISTRAR LA TRANSACCIÓN (Historial)
        Transaccion nuevaTransaccion = new Transaccion();
        nuevaTransaccion.setFecha(LocalDateTime.now());
        nuevaTransaccion.setTarjeta(tarjeta);
        nuevaTransaccion.setEstado(1); // 1 = Aprobado (según tu catálogo)
        nuevaTransaccion.setTipo(request.getIdTipoTransaccion());
        // Asignar servicio por defecto o null si no aplica

        Transaccion transaccionGuardada = transaccionRepository.save(nuevaTransaccion);

        // 6. REGISTRAR EL PAGO (Detalle monetario)
        Pago nuevoPago = new Pago();
        nuevoPago.setMonto(request.getMonto());
        nuevoPago.setTransaccion(transaccionGuardada); // Relacionamos con la anterior
        nuevoPago.setMetodo(1); // 1 = Tarjeta (según catálogo)
        nuevoPago.setIdTipoMoneda(1); // 1 = Colones (o traer de la cuenta)

        pagoRepository.save(nuevoPago);
    }
}