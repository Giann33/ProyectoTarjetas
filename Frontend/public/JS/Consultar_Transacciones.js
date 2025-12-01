
// URL base de tu API (ajustá el puerto si es diferente)
const API_BASE_URL = "http://localhost:8081/api";

// Claves que ya usás en el localStorage
const LOCALSTORAGE_TOKEN_KEY = "token";
const LOCALSTORAGE_USER_ID_KEY = "idUsuario";

const LOCALSTORAGE_USER_KEY = "user";

function getUserFromLocalStorage() {
    const raw = localStorage.getItem(LOCALSTORAGE_USER_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch (e) {
        console.error("No se pudo parsear el usuario del localStorage", e);
        return null;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    cargarTransacciones();
});

function getAuthHeaders() {
    const headers = {
        "Content-Type": "application/json"
    };

    const user = getUserFromLocalStorage();
    if (user && user.token) {
        headers["Authorization"] = `Bearer ${user.token}`;
    }

    return headers;
}

async function cargarTransacciones() {
    const mensajeEstado = document.getElementById("mensajeEstado");
    const tbody = document.querySelector("#tablaTransacciones tbody");

    mensajeEstado.textContent = "Cargando transacciones...";
    mensajeEstado.classList.remove("error");
    tbody.innerHTML = "";

    try {
        const user = getUserFromLocalStorage();
        if (!user || !user.idUsuario) {
            mensajeEstado.textContent = "No se encontró información del usuario en la sesión.";
            mensajeEstado.classList.add("error");
            return;
        }

        const idUsuario = user.idUsuario;

        let url = `${API_BASE_URL}/transacciones/consultar?idUsuario=${encodeURIComponent(idUsuario)}`;

        const response = await fetch(url, {
            method: "GET",
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Error al obtener transacciones (${response.status})`);
        }

        const transacciones = await response.json();
        dibujarTablaTransacciones(transacciones);

        if (!transacciones || transacciones.length === 0) {
            mensajeEstado.textContent = "No hay transacciones registradas para este usuario.";
        } else {
            mensajeEstado.textContent = `Se encontraron ${transacciones.length} transacciones.`;
        }
    } catch (error) {
        console.error("Error consultando transacciones:", error);
        mensajeEstado.textContent = "Ocurrió un error al cargar las transacciones.";
        mensajeEstado.classList.add("error");
    }
}

function dibujarTablaTransacciones(transacciones) {
    const tbody = document.querySelector("#tablaTransacciones tbody");
    tbody.innerHTML = "";

    if (!transacciones || transacciones.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");
        celda.colSpan = 11;
        celda.textContent = "No hay transacciones registradas.";
        fila.appendChild(celda);
        tbody.appendChild(fila);
        return;
    }

    transacciones.forEach(tx => {
        const fila = document.createElement("tr");

        // Ajustá estos nombres de propiedad según tu DTO del backend
        const idTransaccion = tx.idTransaccion;
        const fecha = tx.fecha;
        const estado = tx.estado;
        const tipo = tx.tipo;
        const tarjeta = tx.tarjeta;               // ejemplo: "**** 1234"
        const servicio = tx.servicio;
        const destino = tx.destino;
        const detalle = tx.detalle;
        const metodoPago = tx.metodoPago;
        const monto = tx.monto;
        const tipoMoneda = tx.tipoMoneda;

        const fechaFormateada = formatearFecha(fecha);
        const montoFormateado = formatearMonto(monto);

        agregarCelda(fila, idTransaccion);
        agregarCelda(fila, fechaFormateada);
        agregarCelda(fila, estado);
        agregarCelda(fila, tipo);
        agregarCelda(fila, tarjeta);
        agregarCelda(fila, servicio);
        agregarCelda(fila, destino);
        agregarCelda(fila, detalle);
        agregarCelda(fila, metodoPago);
        agregarCelda(fila, montoFormateado);
        agregarCelda(fila, tipoMoneda);

        tbody.appendChild(fila);
    });
}

function agregarCelda(fila, valor) {
    const td = document.createElement("td");
    td.textContent = valor != null ? valor : "";
    fila.appendChild(td);
}

function formatearFecha(fechaIso) {
    if (!fechaIso) return "";
    const fecha = new Date(fechaIso);
    if (isNaN(fecha.getTime())) return fechaIso; // por si viene en otro formato
    return fecha.toLocaleString("es-CR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatearMonto(monto) {
    if (monto == null || monto === "") return "";
    if (typeof monto === "number") {
        return monto.toLocaleString("es-CR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
    // si viene como string
    const num = Number(monto);
    if (isNaN(num)) return monto;
    return num.toLocaleString("es-CR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}