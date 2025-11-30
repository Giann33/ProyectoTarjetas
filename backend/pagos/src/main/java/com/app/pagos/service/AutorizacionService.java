package com.app.pagos.service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.pagos.dto.AutorizarTransaccionRequest;
import com.app.pagos.dto.AutorizarTransaccionResponse;
import com.app.pagos.entity.Autorizacion;
import com.app.pagos.entity.Bitacora;
import com.app.pagos.entity.Cuenta;
import com.app.pagos.entity.EstadoTransaccion;
import com.app.pagos.entity.MetodoPago;
import com.app.pagos.entity.Pago;
import com.app.pagos.entity.ReporteTransaccion;
import com.app.pagos.entity.Servicio;
import com.app.pagos.entity.Tarjeta;
import com.app.pagos.entity.TipoMoneda;
import com.app.pagos.entity.Transaccion;
import com.app.pagos.entity.Usuario;
import com.app.pagos.repository.AutorizacionRepository;
import com.app.pagos.repository.BitacoraRepository;
import com.app.pagos.repository.CuentaRepository;
import com.app.pagos.repository.EstadoTransaccionRepository;
import com.app.pagos.repository.MetodoPagoRepository;
import com.app.pagos.repository.PagoRepository;
import com.app.pagos.repository.ReporteTransaccionRepository;
import com.app.pagos.repository.ServicioRepository;
import com.app.pagos.repository.TarjetaRepository;
import com.app.pagos.repository.TipoMonedaRepository;
import com.app.pagos.repository.TransaccionRepository;
import com.app.pagos.repository.UsuarioRepository;

@Service
public class AutorizacionService {

        @Autowired
        private TarjetaRepository tarjetaRepository;

        @Autowired
        private ServicioRepository servicioRepository;

        @Autowired
        private UsuarioRepository usuarioRepository;

        @Autowired
        private MetodoPagoRepository metodoPagoRepository;

        @Autowired
        private TipoMonedaRepository tipoMonedaRepository;

        @Autowired
        private TransaccionRepository transaccionRepository;

        @Autowired
        private PagoRepository pagoRepository;

        @Autowired
        private AutorizacionRepository autorizacionRepository;

        @Autowired
        private ReporteTransaccionRepository reporteTransaccionRepository;

        @Autowired
        private BitacoraRepository bitacoraRepository;

        @Autowired
        private EstadoTransaccionRepository estadoTransaccionRepository;

        @Autowired
        private CuentaRepository cuentaRepository;

        @Transactional
public AutorizarTransaccionResponse autorizar(AutorizarTransaccionRequest request) {

    // ---------- 1) CARGAR ENTIDADES BASE ----------
    Tarjeta tarjeta = tarjetaRepository.findById(request.getIdTarjeta())
            .orElseThrow(() -> new IllegalArgumentException("Tarjeta no encontrada"));

    Cuenta cuenta = tarjeta.getCuenta();
    if (cuenta == null) {
        throw new IllegalStateException("La tarjeta no tiene una cuenta asociada");
    }

    Servicio servicio = servicioRepository.findById(request.getIdServicio())
            .orElseThrow(() -> new IllegalArgumentException("Servicio no encontrado"));

    Usuario usuario = usuarioRepository.findById(request.getIdUsuario())
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

    MetodoPago metodo = metodoPagoRepository.findById(request.getIdMetodoPago())
            .orElseThrow(() -> new IllegalArgumentException("Método de pago no encontrado"));

    TipoMoneda tipoMoneda = tipoMonedaRepository.findById(request.getIdTipoMoneda())
            .orElseThrow(() -> new IllegalArgumentException("Tipo de moneda no encontrada"));

    // ---------- 2) SIMULAR BANCO + VALIDAR FONDOS ----------
    LocalDateTime inicioSimulacion = LocalDateTime.now();

    BigDecimal monto = request.getMonto();
    if (monto == null || monto.signum() <= 0) {
        throw new IllegalArgumentException("El monto de la transacción debe ser mayor a cero");
    }

    BigDecimal saldoActual = cuenta.getSaldo();
    if (saldoActual == null) {
        saldoActual = BigDecimal.ZERO;
    }

    // ¿Hay fondos suficientes?
    boolean hayFondos = saldoActual.compareTo(monto) >= 0;

    // Regla actual de ejemplo por monto máximo
    boolean aprobadoPorMonto = monto.compareTo(new BigDecimal("100000")) <= 0;

    // Aprobado solo si pasa regla de monto y hay fondos
    boolean aprobado = aprobadoPorMonto && hayFondos;

    String codigoRespuesta;
    String mensajeRespuesta;

    if (!hayFondos) {
        codigoRespuesta = "51";
        mensajeRespuesta = "Fondos insuficientes";
    } else if (!aprobadoPorMonto) {
        // puedes cambiar este código si usas otro para "monto excedido"
        codigoRespuesta = "05";
        mensajeRespuesta = "Monto excede el límite permitido";
    } else {
        codigoRespuesta = "01";
        mensajeRespuesta = "Transacción aprobada";
    }

    long latenciaMs = java.time.Duration
            .between(inicioSimulacion, LocalDateTime.now())
            .toMillis();

    final int ESTADO_APROBADA_ID  = 1;
    final int ESTADO_RECHAZADA_ID = 2;

    // ---------- 3) CREAR TRANSACCION ----------
    Transaccion transaccion = new Transaccion();
    transaccion.setFecha(LocalDateTime.now());

    EstadoTransaccion estado = estadoTransaccionRepository
            .findById(aprobado ? ESTADO_APROBADA_ID : ESTADO_RECHAZADA_ID)
            .orElseThrow(() -> new IllegalArgumentException("Estado de transacción no encontrado"));

    transaccion.setEstado(estado);
    transaccion.setTipo(request.getTipoTransaccion());
    transaccion.setTarjeta(tarjeta);
    transaccion.setServicio(servicio);
    transaccion.setDestino(request.getDestino());
    transaccion.setDetalle(request.getDetalle());

    transaccion = transaccionRepository.save(transaccion);

    // ---------- 4) SI SE APRUEBA → RESTAR SALDO Y CREAR PAGO ----------
    if (aprobado) {
        // Restar saldo a la cuenta
        BigDecimal nuevoSaldo = saldoActual.subtract(monto);
        cuenta.setSaldo(nuevoSaldo);
        cuentaRepository.save(cuenta);

        // Crear pago solo si la transacción fue aprobada
        Pago pago = new Pago();
        pago.setTransaccion(transaccion);
        pago.setMonto(monto);
        pago.setMetodo(metodo);
        pago.setTipoMoneda(tipoMoneda);

        pagoRepository.save(pago);
    }
    // Si NO se aprueba, no se crea Pago y no se toca el saldo

    // ---------- 5) CREAR AUTORIZACION ----------
    Autorizacion autorizacion = new Autorizacion();
    autorizacion.setTransaccion(transaccion);
    autorizacion.setCodigoRespuesta(codigoRespuesta);
    autorizacion.setMensaje(mensajeRespuesta);
    autorizacion.setAprobado(aprobado);
    autorizacion.setFechaAutorizacion(LocalDateTime.now());

    autorizacionRepository.save(autorizacion);

    // ---------- 6) CREAR REPORTE_TRANSACCION ----------
    StringBuilder comentario = new StringBuilder();
    comentario.append("Transacción ")
            .append(aprobado ? "aprobada" : "rechazada")
            .append(" por ")
            .append(monto)
            .append(" (moneda ID=")
            .append(request.getIdTipoMoneda())
            .append(") para el servicio ")
            .append(servicio.getDescripcion());

    if (request.getDestino() != null && !request.getDestino().isBlank()) {
        comentario.append(". Destino: ").append(request.getDestino());
    }
    if (request.getDetalle() != null && !request.getDetalle().isBlank()) {
        comentario.append(". Detalle: ").append(request.getDetalle());
    }

    ReporteTransaccion reporte = new ReporteTransaccion();
    reporte.setTransaccion(transaccion);
    reporte.setFechaGenerado(LocalDateTime.now());
    reporte.setComentario(comentario.toString());

    reporte = reporteTransaccionRepository.save(reporte);

    // ---------- 7) CREAR BITÁCORA ----------
    Bitacora bitacora = new Bitacora();
    bitacora.setModulo("autorizar");
    bitacora.setAccion("se agrego una transaccion");
    bitacora.setFecha(LocalDateTime.now());
    bitacora.setReporteTransaccion(reporte);
    bitacora.setUsuario(usuario);

    bitacoraRepository.save(bitacora);

    // ---------- 8) ARMAR RESPUESTA ----------
    AutorizarTransaccionResponse response = new AutorizarTransaccionResponse();
    response.setIdTransaccion(transaccion.getIdTransaccion());
    response.setEstado(aprobado ? "APROBADA" : "RECHAZADA");
    response.setCodigoRespuesta(codigoRespuesta);
    response.setMensaje(mensajeRespuesta);
    response.setLatenciaMs(latenciaMs);

    return response;
}
}