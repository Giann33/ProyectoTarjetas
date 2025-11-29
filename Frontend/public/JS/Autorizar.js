
// Endpoint para autorizar transacciones
const API_AUTORIZAR_URL = "http://localhost:8081/api/transacciones/autorizar";

// Endpoint para obtener las tarjetas del usuario logueado
const API_TARJETAS_USUARIO_BASE =
  "http://localhost:8081/api/tarjetas/por-usuario/";

// Clave donde guardas el usuario en localStorage
// En tu caso es "user"
const LOCALSTORAGE_USER_KEY = "user";

// ================================
// INICIO
// ================================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-autorizar");
  const btnEnviar = document.getElementById("btn-enviar");
  const btnLimpiar = document.getElementById("btn-limpiar");
  const errorBox = document.getElementById("form-error");

  const placeholder = document.getElementById("resultado-placeholder");
  const card = document.getElementById("resultado-card");
  const badge = document.getElementById("resultado-estado-badge");
  const iconSpan = document.getElementById("resultado-icon");
  const mensajeP = document.getElementById("resultado-mensaje");
  const idTxSpan = document.getElementById("resultado-id-transaccion");
  const codigoSpan = document.getElementById("resultado-codigo");
  const latenciaSpan = document.getElementById("resultado-latencia");
  const jsonPre = document.getElementById("resultado-json-raw");

  const selectTarjeta = document.getElementById("idTarjeta");

  // 1) Cargar tarjetas del usuario con sesión iniciada
  cargarTarjetasUsuario(selectTarjeta, errorBox);

  // 2) Manejar envío del formulario
  form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.classList.add("hidden");
  errorBox.textContent = "";

  const idTarjeta = parseInt(selectTarjeta.value, 10);
  const idServicio = parseInt(
    document.getElementById("idServicio").value,
    10
  );
  const tipoTransaccion = parseInt(
    document.getElementById("tipoTransaccion").value,
    10
  );
  const idMetodoPago = parseInt(
    document.getElementById("idMetodoPago").value,
    10
  );
  const idTipoMoneda = parseInt(
    document.getElementById("idTipoMoneda").value,
    10
  );

  const montoValue = document.getElementById("monto").value.trim();
  const destino = document.getElementById("destino").value.trim();
  const detalle = document.getElementById("detalle").value.trim();

  const monto = parseFloat(montoValue);

  const idUsuario = obtenerIdUsuarioDesdeLocalStorage();

  if (
    isNaN(idTarjeta) ||
    isNaN(idServicio) ||
    isNaN(tipoTransaccion) ||
    isNaN(idMetodoPago) ||
    isNaN(idTipoMoneda) ||
    isNaN(monto) ||
    monto <= 0 ||
    destino.length === 0 ||
    detalle.length === 0 ||
    !idUsuario
  ) {
    errorBox.textContent =
      "Por favor, completa todos los campos con valores válidos y asegúrate de haber iniciado sesión.";
    errorBox.classList.remove("hidden");
    return;
  }

  const payload = {
    idTarjeta,
    idServicio,
    tipoTransaccion,
    idMetodoPago,
    idTipoMoneda,
    monto,
    destino,
    detalle,
    idUsuario,
  };

  // Bloquear botón mientras se envía
  btnEnviar.disabled = true;
  btnEnviar.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

  try {
    const headers = {
      "Content-Type": "application/json",
    };

    const token = obtenerTokenDesdeLocalStorage();
    if (token) {
      headers["Authorization"] = "Bearer " + token;
    }

    const response = await fetch(API_AUTORIZAR_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        "Error al procesar la autorización. Código HTTP: " + response.status
      );
    }

    const data = await response.json();
    renderResultado(data);
  } catch (err) {
    console.error(err);
    errorBox.textContent =
      "Ocurrió un error al contactar el servicio de autorización.";
    errorBox.classList.remove("hidden");
  } finally {
    btnEnviar.disabled = false;
    btnEnviar.innerHTML =
      '<i class="fa-solid fa-paper-plane"></i> Enviar autorización';
  }
});

  // 3) Botón limpiar
  btnLimpiar.addEventListener("click", () => {
    form.reset();
    errorBox.classList.add("hidden");
    errorBox.textContent = "";
    card.classList.add("hidden");
    placeholder.classList.remove("hidden");
  });

  // Función para pintar el resultado
  function renderResultado(data) {
    if (!data) return;

    placeholder.classList.add("hidden");
    card.classList.remove("hidden");

    const estado = (data.estado || "").toUpperCase();

    badge.textContent = estado || "SIN ESTADO";
    badge.classList.remove(
      "estado-aprobada",
      "estado-rechazada",
      "estado-timeout"
    );

    let iconHtml = '<i class="fa-solid fa-circle-question"></i>';

    if (estado === "APROBADA") {
      badge.classList.add("estado-aprobada");
      iconHtml = '<i class="fa-solid fa-circle-check"></i>';
    } else if (estado === "RECHAZADA") {
      badge.classList.add("estado-rechazada");
      iconHtml = '<i class="fa-solid fa-circle-xmark"></i>';
    } else if (estado === "TIMEOUT") {
      badge.classList.add("estado-timeout");
      iconHtml = '<i class="fa-solid fa-circle-exclamation"></i>';
    }

    iconSpan.innerHTML = iconHtml;

    mensajeP.textContent = data.mensaje || "Sin mensaje.";

    idTxSpan.textContent = data.idTransaccion ?? "—";
    codigoSpan.textContent = data.codigoRespuesta || "—";

    if (typeof data.latenciaMs === "number") {
      latenciaSpan.textContent = data.latenciaMs + " ms";
    } else {
      latenciaSpan.textContent = "—";
    }

    jsonPre.textContent = JSON.stringify(data, null, 2);
  }
});

// ================================
// FUNCIONES AUXILIARES
// ================================

/**
 * Obtiene el idUsuario desde localStorage.
 * En tu caso, el usuario está guardado como JSON bajo la clave "user".
 * Ejemplo:
 *  localStorage.setItem("user", JSON.stringify({ idUsuario: 2, idRol: 1, ... }))
 */
function obtenerIdUsuarioDesdeLocalStorage() {
  console.log("Claves en localStorage:", Object.keys(localStorage));

  const rawUser = localStorage.getItem(LOCALSTORAGE_USER_KEY);
  console.log("rawUser:", rawUser);

  if (!rawUser) {
    console.warn("No se encontró nada en localStorage bajo la clave 'user'");
    return null;
  }

  try {
    const userObj = JSON.parse(rawUser);
    console.log("Objeto user parseado:", userObj);

    if (userObj && userObj.idUsuario != null) {
      const id = parseInt(userObj.idUsuario, 10);
      console.log("idUsuario obtenido desde user.idUsuario:", id);
      return isNaN(id) ? null : id;
    } else {
      console.warn("user.idUsuario es nulo o no existe");
    }
  } catch (e) {
    console.error("Error al parsear user desde localStorage:", e);
  }

  return null;
}

function obtenerTokenDesdeLocalStorage() {
  const rawUser = localStorage.getItem(LOCALSTORAGE_USER_KEY);
  if (!rawUser) return null;

  try {
    const userObj = JSON.parse(rawUser);
    return userObj.token || null;
  } catch (e) {
    console.error("Error al parsear user desde localStorage (token):", e);
    return null;
  }
}

/**
 * Carga las tarjetas del usuario con sesión iniciada y llena el <select>.
 */
async function cargarTarjetasUsuario(selectTarjeta, errorBox) {
  const userId = obtenerIdUsuarioDesdeLocalStorage();
  console.log("idUsuario final usado:", userId);

  // Si no hay usuario en sesión, deshabilita el select
  if (!userId) {
    selectTarjeta.innerHTML =
      '<option value="">Inicia sesión para ver tus tarjetas</option>';
    selectTarjeta.disabled = true;
    if (errorBox) {
      errorBox.textContent =
        "No se encontró un usuario en sesión. Inicia sesión para autorizar transacciones.";
      errorBox.classList.remove("hidden");
    }
    return;
  }

  selectTarjeta.disabled = true;
  selectTarjeta.innerHTML =
    '<option value="">Cargando tarjetas...</option>';

  try {
    const response = await fetch(API_TARJETAS_USUARIO_BASE + userId);

    if (!response.ok) {
      throw new Error(
        "Error al cargar tarjetas. Código HTTP: " + response.status
      );
    }

    const tarjetas = await response.json();

    // Si no hay tarjetas, mostramos un mensaje
    if (!Array.isArray(tarjetas) || tarjetas.length === 0) {
      selectTarjeta.innerHTML =
        '<option value="">No se encontraron tarjetas activas</option>';
      return;
    }

    // Limpiar opciones y agregar las nuevas
    selectTarjeta.innerHTML =
      '<option value="">Seleccione una tarjeta...</option>';

    tarjetas.forEach((tarjeta) => {
      const option = document.createElement("option");
      option.value = tarjeta.idTarjeta;

      const texto = construirTextoTarjeta(tarjeta);

      option.textContent = texto;
      selectTarjeta.appendChild(option);
    });

    selectTarjeta.disabled = false;
  } catch (error) {
    console.error(error);
    selectTarjeta.innerHTML =
      '<option value="">Error al cargar tarjetas</option>';
    if (errorBox) {
      errorBox.textContent =
        "Ocurrió un error al cargar las tarjetas del usuario.";
      errorBox.classList.remove("hidden");
    }
  }
}

/**
 * Construye el texto legible que se muestra en el <select> para cada tarjeta.
 * Esperado: { idTarjeta, numeroEnmascarado, tipo }
 */
function construirTextoTarjeta(tarjeta) {
  const numero = tarjeta.numeroEnmascarado || "****";
  const tipo = tarjeta.tipo || "Tarjeta";

  return `${tipo} • ${numero}`;
}