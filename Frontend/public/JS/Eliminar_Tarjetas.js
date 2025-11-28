document.addEventListener("DOMContentLoaded", () => {
    cargarTarjetasEliminar();
});

function cargarTarjetasEliminar() {
    fetch("http://localhost:8081/api/tarjetas")
        .then(response => response.json())
        .then(tarjetas => {
            const tbody = document.querySelector("#tablaEliminar tbody");
            tbody.innerHTML = ""; // Limpiar tabla

            if (tarjetas.length === 0) {
                tbody.innerHTML = "<tr><td colspan='6' style='text-align:center'>No hay tarjetas para eliminar.</td></tr>";
                return;
            }

            tarjetas.forEach(t => {
                const fila = document.createElement("tr");

                // Convertir IDs a Texto
                let emisor = t.idEmisor === 1 ? "Visa" : (t.idEmisor === 2 ? "Mastercard" : "Otro");
                let tipo = t.idTipoTarjeta === 1 ? "Débito" : "Crédito";

                fila.innerHTML = `
                    <td>${t.idTarjeta}</td>
                    <td>${t.numeroTarjeta}</td>
                    <td>${emisor}</td>
                    <td>${tipo}</td>
                    <td>${t.idCuenta}</td>
                    <td style="text-align: center;">
                        <button onclick="eliminarTarjeta(${t.idTarjeta})" 
                                style="background-color: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                            <i class="fa-solid fa-trash"></i> Eliminar
                        </button>
                    </td>
                `;
                tbody.appendChild(fila);
            });
        })
        .catch(error => {
            console.error("Error:", error);
            alert("No se pudo cargar la lista de tarjetas.");
        });
}

function eliminarTarjeta(id) {
    // 1. Confirmación de seguridad
    if (!confirm(`¿Estás SEGURO de que deseas eliminar la tarjeta con ID ${id}? Esta acción no se puede deshacer.`)) {
        return; // Si dice que no, no hacemos nada
    }

    // 2. Enviar petición DELETE al Backend
    fetch(`http://localhost:8081/api/tarjetas/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                alert("✅ Tarjeta eliminada correctamente.");
                cargarTarjetasEliminar(); // Recargamos la tabla para ver que ya no está
            } else {
                alert("❌ No se pudo eliminar la tarjeta. Puede que tenga transacciones asociadas.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Error de conexión al intentar eliminar.");
        });
}