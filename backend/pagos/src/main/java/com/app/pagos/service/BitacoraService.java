package com.app.pagos.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.app.pagos.dto.BitacoraViewConsulta;
import com.app.pagos.entity.Bitacora;
import com.app.pagos.repository.BitacoraRepository;

@Service
public class BitacoraService {

    @Autowired
    private BitacoraRepository bitacoraRepository;

    public List<BitacoraViewConsulta> consultarBitacora() {
        List<Bitacora> lista = bitacoraRepository.findAll();
        List<BitacoraViewConsulta> resultado = new ArrayList<>();

        for (Bitacora b : lista) {
            resultado.add(BitacoraViewConsulta.from(b));
        }

        return resultado;
    }
}
