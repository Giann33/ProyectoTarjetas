// ========================
// CONFIGURACIONES GLOBALES
// ========================
const API_BASE_URL = "http://localhost:8081/api";
const LOCALSTORAGE_USER_KEY = "user";

// ========================
// FUNCIONES AUXILIARES
// ========================
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

function getAuthHeaders() {
    const headers = { "Content-Type": "application/json" };

    const user = getUserFromLocalStorage();
    if (user && user.token) {
        headers["Authorization"] = `Bearer ${user.token}`;
    }

    return headers;
}

// ========================
// CARGAR BITÁCORA
// ========================
document.addEventListener("DOMContentLoaded", () => {
    cargarBitacora();
});

async function cargarBitacora() {
    const mensajeEstado = document.getElementById("mensajeEstadoBitacora");
    const tbody = document.querySelector("#tablaBitacora tbody");

    mensajeEstado.textContent = "Cargando bitácora...";
    mensajeEstado.classList.remove("error");
    tbody.innerHTML = "";

    try {
        const url = `${API_BASE_URL}/bitacora/consultar`;

        const response = await fetch(url, {
            method: "GET",
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Error al obtener bitácora (${response.status})`);
        }

        const eventos = await response.json();
        dibujarTablaBitacora(eventos);

        mensajeEstado.textContent =
            !eventos || eventos.length === 0
                ? "No hay eventos registrados en la bitácora."
                : `Se encontraron ${eventos.length} eventos en la bitácora.`;

    } catch (error) {
        console.error("Error consultando bitácora:", error);
        mensajeEstado.textContent = "Ocurrió un error al cargar la bitácora.";
        mensajeEstado.classList.add("error");
    }
}

// ========================
// TABLA
// ========================
function dibujarTablaBitacora(eventos) {
    const tbody = document.querySelector("#tablaBitacora tbody");
    tbody.innerHTML = "";

    if (!eventos || eventos.length === 0) {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td colspan="6">No hay eventos en la bitácora.</td>`;
        tbody.appendChild(fila);
        return;
    }

    eventos.forEach(ev => {
        const fila = document.createElement("tr");

        // 👉 Estos nombres tienen que coincidir con el DTO
        agregarCelda(fila, ev.idBitacora);
        agregarCelda(fila, formatearFecha(ev.fecha));
        agregarCelda(fila, ev.modulo);
        agregarCelda(fila, ev.accion);
        agregarCelda(fila, ev.idReporte);
        agregarCelda(fila, ev.idUsuario);

        tbody.appendChild(fila);
    });
}

function agregarCelda(fila, valor) {
    const td = document.createElement("td");
    td.textContent = valor ?? "";
    fila.appendChild(td);
}

function formatearFecha(fechaIso) {
    if (!fechaIso) return "";
    const fecha = new Date(fechaIso);
    if (isNaN(fecha.getTime())) return fechaIso;
    return fecha.toLocaleString("es-CR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}