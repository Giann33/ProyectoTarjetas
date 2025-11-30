const API_BASE_URL = "http://localhost:8081/api";
const LOCALSTORAGE_USER_KEY = "user";

let usuarioSesion = null;
let tarjetaActual = null;

// -----------------------------
// Helpers
// -----------------------------
function obtenerUsuarioEnSesion() {
  const raw = localStorage.getItem(LOCALSTORAGE_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("No se pudo parsear el usuario del localStorage:", e);
    return null;
  }
}

// Carga las cuentas del usuario y llena el <select>
async function cargarCuentasUsuario() {
  const selectCuenta = document.getElementById("idCuenta");
  if (!selectCuenta) {
    console.error("No encontré el select con id 'idCuenta'");
    return;
  }

  selectCuenta.innerHTML = `<option value="">Cargando cuentas...</option>`;

  try {
    const resp = await fetch(
      `${API_BASE_URL}/cuentas/usuario/${usuarioSesion.idUsuario}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${usuarioSesion.token}`
        }
      }
    );

    if (!resp.ok) {
      throw new Error("Error al obtener las cuentas del usuario");
    }

    const cuentas = await resp.json();

    if (!Array.isArray(cuentas) || cuentas.length === 0) {
      selectCuenta.innerHTML =
        `<option value="">No tienes cuentas asociadas</option>`;
      return;
    }

    selectCuenta.innerHTML =
      `<option value="">-- Seleccione una cuenta --</option>`;

    cuentas.forEach(cuenta => {
      const option = document.createElement("option");
      option.value = cuenta.idCuenta;           // valor = idCuenta
      option.textContent = cuenta.numeroCuenta; // lo que ve el usuario
      selectCuenta.appendChild(option);
    });
  } catch (err) {
    console.error(err);
    alert("Error cargando las cuentas. Intenta de nuevo más tarde.");
    selectCuenta.innerHTML =
      `<option value="">Error al cargar las cuentas</option>`;
  }
}

// Carga la tarjeta (usamos el mismo GET de todas y filtramos por id)
async function cargarTarjetaPorId(idTarjeta) {
  const resp = await fetch(`${API_BASE_URL}/tarjetas`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${usuarioSesion.token}`
    }
  });

  if (!resp.ok) {
    throw new Error("Error al obtener las tarjetas");
  }

  const tarjetas = await resp.json();
  const t = tarjetas.find(t => t.idTarjeta == idTarjeta);

  if (!t) {
    throw new Error("Tarjeta no encontrada");
  }

  tarjetaActual = t;
}

// Rellena el formulario con la tarjetaActual
function llenarFormulario(t) {
  document.getElementById("idTarjeta").value = t.idTarjeta;
  document.getElementById("numTarjeta").value = t.numeroTarjeta;
  document.getElementById("fechaExp").value = t.fechaExpiracion;
  document.getElementById("cvv").value = t.cvv;
  document.getElementById("pin").value = t.pin;
  document.getElementById("emisor").value = t.idEmisor;
  document.getElementById("tipoTarjeta").value = t.idTipoTarjeta;

  // El select ya está lleno, solo ponemos el valor
  const selectCuenta = document.getElementById("idCuenta");
  if (selectCuenta) {
    selectCuenta.value = t.idCuenta ?? "";
  }
}

// -----------------------------
// DOMContentLoaded
// -----------------------------
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    alert("No se especificó ninguna tarjeta para editar.");
    window.location.href = "Consultar_Tarjetas.html";
    return;
  }

  usuarioSesion = obtenerUsuarioEnSesion();
  if (!usuarioSesion) {
    alert("No hay sesión activa. Vuelve a iniciar sesión.");
    window.location.href = "Login.html"; // ajusta si tienes otra ruta
    return;
  }

  try {
    // 1. Cargar cuentas del usuario
    await cargarCuentasUsuario();
    // 2. Cargar la tarjeta a editar
    await cargarTarjetaPorId(id);
    // 3. Llenar el formulario
    llenarFormulario(tarjetaActual);
  } catch (err) {
    console.error(err);
    alert("Ocurrió un error cargando la información de la tarjeta.");
    window.location.href = "Consultar_Tarjetas.html";
    return;
  }

  // Enganchamos el submit después de tener todo listo
  const form = document.getElementById("formEditar");
  if (form) {
    form.addEventListener("submit", manejarSubmitEditar);
  }
});

// -----------------------------
// Enviar cambios (PUT)
// -----------------------------
async function manejarSubmitEditar(e) {
  e.preventDefault();

  const id = document.getElementById("idTarjeta").value;
  const idCuentaSeleccionada = document.getElementById("idCuenta").value;

  if (!idCuentaSeleccionada) {
    alert("Debes seleccionar una cuenta asociada.");
    return;
  }

  const data = {
    numeroTarjeta: document.getElementById("numTarjeta").value.trim(),
    fechaExpiracion: document.getElementById("fechaExp").value.trim(),
    cvv: document.getElementById("cvv").value.trim(),
    pin: document.getElementById("pin").value.trim(),
    idEmisor: parseInt(document.getElementById("emisor").value),
    idTipoTarjeta: parseInt(document.getElementById("tipoTarjeta").value),
    idCuenta: parseInt(idCuentaSeleccionada, 10) // idCuenta, no numeroCuenta
  };

  try {
    const resp = await fetch(`${API_BASE_URL}/tarjetas/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${usuarioSesion.token}`
      },
      body: JSON.stringify(data)
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(text || "Error al actualizar la tarjeta");
    }

    alert("✅ Tarjeta actualizada correctamente");
    window.location.href = "Consultar_Tarjetas.html";
  } catch (err) {
    console.error("Error al actualizar tarjeta:", err);
    alert("❌ Ocurrió un error al actualizar la tarjeta. Revisa la consola.");
  }
}