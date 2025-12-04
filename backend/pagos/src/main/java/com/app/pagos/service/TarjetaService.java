package com.app.pagos.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.app.pagos.dto.EditarTarjetaRequest;
import com.app.pagos.dto.TarjetaView; // Asegúrate de tener este o usar el ViewConsulta
import com.app.pagos.dto.TarjetaViewConsulta;
import com.app.pagos.entity.Cuenta;
import com.app.pagos.entity.Tarjeta;
import com.app.pagos.repository.CuentaRepository;
import com.app.pagos.repository.TarjetaRepository;

import jakarta.transaction.Transactional;

@Service
public class TarjetaService {

    @Autowired
    private TarjetaRepository tarjetaRepository;
    @Autowired
    private CuentaRepository cuentaRepository;

    public List<TarjetaViewConsulta> listarTodas() {
        return tarjetaRepository.findAll().stream()
                .map(TarjetaViewConsulta::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public TarjetaViewConsulta actualizarTarjeta(Integer idTarjeta, EditarTarjetaRequest req) {
        Tarjeta tarjeta = tarjetaRepository.findById(idTarjeta)
                .orElseThrow(() -> new RuntimeException("Tarjeta no encontrada"));

        if (req.getNumeroTarjeta() != null)
            tarjeta.setNumeroTarjeta(req.getNumeroTarjeta());

        // --- YA NO HACEMOS PARSE DE FECHA, PASAMOS EL STRING DIRECTO ---
        if (req.getFechaExpiracion() != null) {
            tarjeta.setFechaExpiracion(req.getFechaExpiracion());
        }

        if (req.getCvv() != null)
            tarjeta.setCvv(req.getCvv());
        if (req.getPin() != null)
            tarjeta.setPin(req.getPin());
        if (req.getIdEmisor() != null)
            tarjeta.setIdEmisor(req.getIdEmisor());
        if (req.getIdTipoTarjeta() != null)
            tarjeta.setIdTipoTarjeta(req.getIdTipoTarjeta());

        // Verifica que tu DTO 'EditarTarjetaRequest' tenga el campo getActivo() si usas
        // esto
        // si no, borra la línea de abajo.
        if (req.getActivo() != null)
            tarjeta.setActivo(req.getActivo());

        if (req.getIdCuenta() != null) {
            Cuenta cuenta = cuentaRepository.findById(req.getIdCuenta())
                    .orElseThrow(() -> new RuntimeException("Cuenta no encontrada"));
            tarjeta.setCuenta(cuenta);
        }

        tarjetaRepository.save(tarjeta);
        return TarjetaViewConsulta.from(tarjeta);
    }

    // Método auxiliar para vistas simples (opcional)
    public List<TarjetaView> obtenerTarjetasPorUsuario(Integer idUsuario) {
        List<Tarjeta> tarjetas = tarjetaRepository.findByUsuarioId(idUsuario); // Asegúrate que tu Repo tenga este
                                                                               // método
        return tarjetas.stream().map(t -> {
            TarjetaView v = new TarjetaView();
            v.setIdTarjeta(t.getIdTarjeta());
            v.setNumeroEnmascarado(
                    "**** " + t.getNumeroTarjeta().substring(Math.max(0, t.getNumeroTarjeta().length() - 4)));
            v.setTipo(String.valueOf(t.getIdTipoTarjeta()));
            return v;
        }).collect(Collectors.toList());
    }
}