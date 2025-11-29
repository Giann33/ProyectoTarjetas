package com.app.pagos.service;

import com.app.pagos.dto.AutorizarTransaccionRequest;
import org.springframework.stereotype.Component;

import java.util.Random;

@Component
public class EmisorService {

    private final Random random = new Random();

    public EmisorResponse autorizar(AutorizarTransaccionRequest request) {
        // Simular latencia (servidor remoto)
        try {
            long sleep = 200 + random.nextInt(1800);
            Thread.sleep(sleep);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        int r = random.nextInt(100);

        if (r < 70) {
            return new EmisorResponse(true, "00", "APROBADA");
        } else if (r < 90) {
            return new EmisorResponse(false, "51", "FONDOS INSUFICIENTES");
        } else {
            // 10% sin respuesta → simulamos timeout
            return null;
        }
    }

    public static class EmisorResponse {
        private final boolean aprobado;
        private final String codigo;
        private final String mensaje;

        public EmisorResponse(boolean aprobado, String codigo, String mensaje) {
            this.aprobado = aprobado;
            this.codigo = codigo;
            this.mensaje = mensaje;
        }

        public boolean isAprobado() {
            return aprobado;
        }

        public String getCodigo() {
            return codigo;
        }

        public String getMensaje() {
            return mensaje;
        }
    }
}