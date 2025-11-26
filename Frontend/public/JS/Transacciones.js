document.addEventListener("DOMContentLoaded", () => {
    cargarTarjetasUsuario();

    const form = document.getElementById("form-transaccion");
    form.addEventListener("submit", procesarTransaccion);
});

async function cargarTarjetasUsuario() {
    // 1. Obtener el usuario logueado del LocalStorage
    const usuarioString = localStorage.getItem("usuario");
   /* if (!usuarioString) {
        alert("No has iniciado sesión");
        window.location.href = "index.html"; // O tu login
        return;
    }*/

    const usuario = JSON.parse(usuarioString);
    const select = document.getElementById("selTarjeta");

    try {
        // LLAMADA AL BACKEND PARA OBTENER TARJETAS
        // NOTA: Asegúrate de tener este endpoint en tu backend (ver punto 3 abajo)
        const response = await fetch(`http://localhost:8080/api/tarjetas/usuario/${usuario.idUsuario}`);

        if (response.ok) {
            const tarjetas = await response.json();
            select.innerHTML = '<option value="">-- Seleccione una tarjeta --</option>';

            tarjetas.forEach(t => {
                // Solo mostramos tarjetas activas
                if (t.activo) {
                    const opcion = document.createElement("option");
                    opcion.value = t.idTarjeta;
                    opcion.textContent = `${t.numeroTarjeta} (Exp: ${t.fechaExpiracion})`;
                    select.appendChild(opcion);
                }
            });
        } else {
            select.innerHTML = '<option value="">Error cargando tarjetas</option>';
        }
    } catch (error) {
        console.error("Error:", error);
        select.innerHTML = '<option value="">Error de conexión</option>';
    }
}

async function procesarTransaccion(e) {
    e.preventDefault(); // Evita que la página se recargue sola

    const idTarjeta = document.getElementById("selTarjeta").value;
    const tipo = document.getElementById("selTipo").value;
    const detalle = document.getElementById("txtDetalle").value;
    const monto = document.getElementById("txtMonto").value;

    if (!idTarjeta) {
        alert("Por favor seleccione una tarjeta válida.");
        return;
    }

    // Objeto JSON igual al DTO "TransaccionRequest" de Java
    const datosPago = {
        idTarjeta: parseInt(idTarjeta),
        monto: parseFloat(monto),
        detalle: detalle,
        idTipoTransaccion: parseInt(tipo)
    };

    try {
        const response = await fetch("http://localhost:8080/api/transacciones/realizar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datosPago)
        });

        if (response.ok) {
            const mensaje = await response.text();
            alert("✅ ¡Éxito! " + mensaje);
            window.location.href = "Consultas.html"; // Redirigir al inicio para ver el nuevo saldo
        } else {
            const errorMsg = await response.text();
            alert("❌ Error: " + errorMsg); // Ej: "Fondos insuficientes"
        }
    } catch (error) {
        console.error("Error de red:", error);
        alert("Error de conexión con el servidor.");
    }
}