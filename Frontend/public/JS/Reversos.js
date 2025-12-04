const API_URL = "http://localhost:8081/api/reversos";

document.addEventListener("DOMContentLoaded", () => {
    cargarDuplicados();
});

async function cargarDuplicados() {
    const tbody = document.getElementById("tabla-duplicados");
    const mensajeVacio = document.getElementById("mensaje-vacio");
    const tablaContainer = document.querySelector(".table-responsive");

    try {
        const response = await fetch(`${API_URL}/duplicados`);
        if (!response.ok) throw new Error("Error del servidor");

        const transacciones = await response.json();
        tbody.innerHTML = "";

        if (!Array.isArray(transacciones) || transacciones.length === 0) {
            tablaContainer.style.display = "none";
            mensajeVacio.style.display = "block";
            return;
        }

        tablaContainer.style.display = "block";
        mensajeVacio.style.display = "none";

        transacciones.forEach(t => {
            const fila = document.createElement("tr");

            // Lógica visual: Si está completado, ponemos un check verde y deshabilitamos botón
            let estadoHtml = `<span style="color: orange; font-weight: bold;">Pendiente</span>`;
            let botonHtml = `
                <button class="btn-reversar" onclick="solicitarReverso(${t.idTransaccion}, this)">
                    ↩️ Reversar
                </button>`;

            if (t.estadoReverso === "Completado") {
                estadoHtml = `<span style="color: green; font-weight: bold;">✅ Completado</span>`;
                botonHtml = `<button class="btn-reversar" disabled style="opacity: 0.5; cursor: not-allowed;">Reversado</button>`;
            }

            fila.innerHTML = `
                <td>${t.idTransaccion}</td>
                <td>${t.fecha || 'N/A'}</td>
                <td>${t.numeroTarjeta || '****'}</td>
                <td>${t.monto}</td>
                <td>${t.destino || 'Sin destino'}</td>
                
                <td>${estadoHtml}</td>
                
                <td>${botonHtml}</td>
            `;
            tbody.appendChild(fila);
        });

    } catch (error) {
        console.error(error);
        mensajeVacio.innerText = "Error al cargar datos.";
    }
}

// Función actualizada para llamar al Backend real
async function solicitarReverso(id, btnElement) {
    if (!confirm(`¿Deseas aplicar reverso a la transacción #${id}?`)) return;

    try {
        // Llamada al backend POST
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'POST'
        });

        if (response.ok) {
            alert("Proceso de reverso iniciado y completado para ID: " + id);

            // Actualizar la fila visualmente sin recargar toda la página
            const fila = btnElement.closest("tr");
            // Celda de Estado (índice 5)
            fila.cells[5].innerHTML = `<span style="color: green; font-weight: bold;">✅ Completado</span>`;
            // Celda de Botón (índice 6)
            fila.cells[6].innerHTML = `<button class="btn-reversar" disabled style="opacity: 0.5; cursor: not-allowed;">Reversado</button>`;

        } else {
            const errorText = await response.text();
            alert("Error: " + errorText);
        }
    } catch (error) {
        alert("Error de conexión al intentar reversar.");
        console.error(error);
    }
}