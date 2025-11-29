package com.app.pagos.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.app.pagos.dto.EditarTarjetaRequest;
import com.app.pagos.dto.TarjetaView;
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

    public List<TarjetaView> obtenerTarjetasPorUsuario(Integer idUsuario) {
    List<Tarjeta> tarjetas = tarjetaRepository.findByUsuarioId(idUsuario);

    return tarjetas.stream().map(t -> {
        TarjetaView v = new TarjetaView();
        v.setIdTarjeta(t.getIdTarjeta());

        // Ajusta este nombre al campo real que tengas en Tarjeta
        // Por ejemplo: Numero_Tarjeta, numeroTarjeta, etc.
        v.setNumeroEnmascarado(enmascararNumero(t.getNumeroTarjeta()));

        // Aquí está el cambio importante:
        // tipo es String en el DTO, pero en Tarjeta es Integer (idTipoTarjeta)
        if (t.getIdTipoTarjeta() != null) {
            v.setTipo(String.valueOf(t.getIdTipoTarjeta()));
        } else {
            v.setTipo(null); // o "N/A"
        }

        return v;
    }).collect(Collectors.toList());
}



    private String enmascararNumero(String numeroReal) {
        if (numeroReal == null || numeroReal.length() < 4) {
            return "****";
        }
        String ultimos4 = numeroReal.substring(numeroReal.length() - 4);
        return "**** **** **** " + ultimos4;
    }

    public List<TarjetaViewConsulta> listarTarjetas() {
    List<Tarjeta> tarjetas = tarjetaRepository.findAll();

    return tarjetas.stream()
            .map(TarjetaViewConsulta::from)   // usa tu método estático from(...)
            .collect(Collectors.toList());
}

public List<TarjetaViewConsulta> listarTodas() {
    List<Tarjeta> tarjetas = tarjetaRepository.findAll();

    return tarjetas.stream()
            .map(TarjetaViewConsulta::from)   // usamos el método estático del DTO
            .collect(Collectors.toList());
}

    @Transactional
    public TarjetaViewConsulta actualizarTarjeta(Integer idTarjeta, EditarTarjetaRequest req) {

        Tarjeta tarjeta = tarjetaRepository.findById(idTarjeta)
                .orElseThrow(() -> new RuntimeException("Tarjeta no encontrada"));

        tarjeta.setNumeroTarjeta(req.getNumeroTarjeta());
        tarjeta.setFechaExpiracion(req.getFechaExpiracion());
        tarjeta.setCvv(req.getCvv());
        tarjeta.setPin(req.getPin());
        tarjeta.setIdEmisor(req.getIdEmisor());
        tarjeta.setIdTipoTarjeta(req.getIdTipoTarjeta());

        if (req.getIdCuenta() != null) {
            Cuenta cuenta = cuentaRepository.findById(req.getIdCuenta())
                    .orElseThrow(() -> new RuntimeException("Cuenta no encontrada"));
            tarjeta.setCuenta(cuenta);
        }

        tarjetaRepository.save(tarjeta);

        return TarjetaViewConsulta.from(tarjeta);
    }
}