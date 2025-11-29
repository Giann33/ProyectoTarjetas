package com.app.pagos.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.pagos.dto.TransaccionRequest;
import com.app.pagos.entity.Cuenta;
import com.app.pagos.entity.EstadoTransaccion;
import com.app.pagos.entity.MetodoPago;
import com.app.pagos.entity.Pago;
import com.app.pagos.entity.Tarjeta;
import com.app.pagos.entity.TipoMoneda;
import com.app.pagos.entity.Transaccion;
import com.app.pagos.repository.CuentaRepository;
import com.app.pagos.repository.EstadoTransaccionRepository;
import com.app.pagos.repository.MetodoPagoRepository;
import com.app.pagos.repository.PagoRepository;
import com.app.pagos.repository.TarjetaRepository;
import com.app.pagos.repository.TipoMonedaRepository;
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
    @Autowired
private MetodoPagoRepository metodoPagoRepository;

@Autowired
private EstadoTransaccionRepository estadoTransaccionRepository;

@Autowired
private TipoMonedaRepository tipoMonedaRepository;

    @Transactional
    public void procesarPago(TransaccionRequest request) throws Exception {

        // 1. CORRECCIÓN: Quitamos Long.valueOf(...)
        // Si request.getIdTarjeta() ya es un número, lo pasamos directo.
        // Si fuera String, usaríamos Integer.valueOf()
        Tarjeta tarjeta = tarjetaRepository.findById(request.getIdTarjeta())
                .orElseThrow(() -> new Exception("Tarjeta no encontrada"));

        // 2. Obtener el ID de la cuenta desde la tarjeta
        Integer idCuenta = tarjeta.getCuenta().getIdCuenta();

        // 3. CORRECCIÓN: Quitamos Long.valueOf(...)
        // idCuenta ya es Integer, así que lo pasamos directo
        Cuenta cuenta = cuentaRepository.findById(idCuenta)
                .orElseThrow(() -> new Exception("Cuenta asociada a la tarjeta no encontrada"));

        // 4. VALIDAR FONDOS
        if (cuenta.getSaldo().compareTo(request.getMonto()) < 0) {
            throw new Exception("Fondos insuficientes en la cuenta");
        }

        // 5. DESCONTAR DINERO
        cuenta.setSaldo(cuenta.getSaldo().subtract(request.getMonto()));
        cuentaRepository.save(cuenta);

        // 6. REGISTRAR LA TRANSACCIÓN
        Transaccion nuevaTransaccion = new Transaccion();
        nuevaTransaccion.setFecha(LocalDateTime.now());

        // Asignamos la tarjeta encontrada
        nuevaTransaccion.setTarjeta(tarjeta);

final int ESTADO_APROBADA_ID = 1; // ajusta al ID real de tu catálogo

EstadoTransaccion estado = estadoTransaccionRepository
        .findById(ESTADO_APROBADA_ID)
        .orElseThrow(() -> new IllegalArgumentException("Estado de transacción no encontrado"));
        
        nuevaTransaccion.setEstado(estado); // 1 = Aprobado
        nuevaTransaccion.setTipo(request.getIdTipoTransaccion());

        Transaccion transaccionGuardada = transaccionRepository.save(nuevaTransaccion);

        // 7. REGISTRAR EL PAGO
        Pago nuevoPago = new Pago();
        nuevoPago.setMonto(request.getMonto());
        nuevoPago.setTransaccion(transaccionGuardada);

        // Aquí decides qué IDs usar. Por ahora usas 1 fijo:
MetodoPago metodo = metodoPagoRepository.findById(1)
        .orElseThrow(() -> new Exception("Método de pago no encontrado"));

TipoMoneda tipoMoneda = tipoMonedaRepository.findById(1)
        .orElseThrow(() -> new Exception("Tipo de moneda no encontrado"));

       nuevoPago.setMetodo(metodo);         // ✅ ahora recibe un MetodoPago
nuevoPago.setTipoMoneda(tipoMoneda); // ✅ ahora recibe un TipoMoneda

        pagoRepository.save(nuevoPago);
    }
}