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

                TipoMoneda monedaTransaccion = tipoMonedaRepository.findById(request.getIdTipoMoneda())
                                .orElseThrow(() -> new IllegalArgumentException("Tipo de moneda no encontrada"));

                // 👇 OJO: aquí asumo que Cuenta tiene un objeto TipoMoneda
                // Si en tu entidad tienes solo un idTipoMoneda, tendrías que hacer:
                // TipoMoneda monedaCuenta =
                // tipoMonedaRepository.findById(cuenta.getIdTipoMoneda()).orElseThrow(...);
                int idTipoMonedaCuenta = cuenta.getCatalogo_tipo_cuenta_idTipoCuenta();

                TipoMoneda monedaCuenta = tipoMonedaRepository.findById(idTipoMonedaCuenta)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Tipo de moneda de la cuenta no encontrado"));

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

                // 💱 Convertir el monto de la TRANSACCIÓN a la moneda de la CUENTA
                BigDecimal montoEnMonedaCuenta = convertirMonto(monto, monedaTransaccion, monedaCuenta);

                // Validar fondos con el monto convertido
                boolean hayFondos = saldoActual.compareTo(montoEnMonedaCuenta) >= 0;

                // Regla por límite máximo usando el monto original (si quieres, puedes aplicar
                // sobre el convertido)
                boolean aprobadoPorMonto = monto.compareTo(new BigDecimal("100000")) <= 0;

                boolean aprobado = aprobadoPorMonto && hayFondos;

                String codigoRespuesta;
                String mensajeRespuesta;

                if (!hayFondos) {
                        codigoRespuesta = "51";
                        mensajeRespuesta = "Fondos insuficientes";
                } else if (!aprobadoPorMonto) {
                        codigoRespuesta = "05";
                        mensajeRespuesta = "Monto excede el límite permitido";
                } else {
                        codigoRespuesta = "01";
                        mensajeRespuesta = "Transacción aprobada";
                }

                long latenciaMs = java.time.Duration
                                .between(inicioSimulacion, LocalDateTime.now())
                                .toMillis();

                final int ESTADO_APROBADA_ID = 1;
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
                        // Restar el saldo usando el monto convertido a la moneda de la cuenta
                        BigDecimal nuevoSaldo = saldoActual.subtract(montoEnMonedaCuenta);
                        cuenta.setSaldo(nuevoSaldo);
                        cuentaRepository.save(cuenta);

                        // Crear pago con el monto ORIGINAL (en la moneda de la transacción)
                        Pago pago = new Pago();
                        pago.setTransaccion(transaccion);
                        pago.setMonto(monto); // en la divisa seleccionada por el usuario
                        pago.setMetodo(metodo);
                        pago.setTipoMoneda(monedaTransaccion);

                        pagoRepository.save(pago);
                }

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
                                .append(" (moneda transacción ID=")
                                .append(request.getIdTipoMoneda())
                                .append(") en cuenta con moneda ID=")
                                .append(monedaCuenta != null ? monedaCuenta.getIdTipoMoneda() : null)
                                .append(" para el servicio ")
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
                if (aprobado) {
                        bitacora.setAccion("Se autorizó una transacción exitosamente");
                } else {
                        bitacora.setAccion("Se rechazó una transacción");
                }
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

        private static final BigDecimal TIPO_CAMBIO_USD_CRC = new BigDecimal("500.00");

        // Determina si una moneda es USD según su descripción (ajusta al nombre real
        // que tengas en BD)
        private boolean esDolar(TipoMoneda moneda) {
                if (moneda == null)
                        return false;

                String desc = moneda.getDescripcion(); 
                if (desc == null)
                        return false;

                String upper = desc.toUpperCase();
                return upper.contains("DOLAR") || upper.contains("DÓLAR") || upper.contains("USD");
        }

        private BigDecimal convertirMonto(BigDecimal monto, TipoMoneda origen, TipoMoneda destino) {
                if (monto == null || origen == null || destino == null) {
                        return BigDecimal.ZERO;
                }

                boolean origenEsDolar = esDolar(origen);
                boolean destinoEsDolar = esDolar(destino);

                // Misma moneda → no se hace nada
                if (origenEsDolar == destinoEsDolar) {
                        return monto;
                }

                // USD → CRC
                if (origenEsDolar && !destinoEsDolar) {
                        return monto.multiply(TIPO_CAMBIO_USD_CRC);
                }

                // CRC → USD
                if (!origenEsDolar && destinoEsDolar) {
                        // dividimos con escala y redondeo para evitar ArithmeticException
                        return monto.divide(TIPO_CAMBIO_USD_CRC, 2, java.math.RoundingMode.HALF_UP);
                }

                // Por si acaso
                return monto;
        }

}