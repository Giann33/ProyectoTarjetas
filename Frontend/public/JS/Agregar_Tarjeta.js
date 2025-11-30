const API_BASE_URL = "http://localhost:8081/api"; // ajusta si usas otra base
const LOCALSTORAGE_USER_KEY = "user";

// Cuando cargue la página, traigo las cuentas y engancho el submit
document.addEventListener("DOMContentLoaded", () => {
  cargarCuentasUsuario();

  const form = document.getElementById("formTarjeta");
  if (form) {
    form.addEventListener("submit", manejarSubmitTarjeta);
  }
});

// -----------------------------
// Helpers de sesión
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

// -----------------------------
// Cargar cuentas del usuario
// -----------------------------
async function cargarCuentasUsuario() {
  const usuario = obtenerUsuarioEnSesion();
  const selectCuenta = document.getElementById("idCuenta");

  if (!selectCuenta) {
    console.error("No encontré el select con id 'idCuenta'");
    return;
  }

  if (!usuario || !usuario.idUsuario) {
    alert("No se encontró información del usuario en sesión. Vuelve a iniciar sesión.");
    // Si quieres, redirige al login aquí
    return;
  }

  // Mensaje temporal
  selectCuenta.innerHTML = `<option value="">Cargando cuentas...</option>`;

  try {
    const resp = await fetch(
      `${API_BASE_URL}/cuentas/usuario/${usuario.idUsuario}`,
      {
        headers: {
          "Content-Type": "application/json",
          // Si tu backend valida el token:
          Authorization: `Bearer ${usuario.token}`
        }
      }
    );

    if (!resp.ok) {
      throw new Error("Error al obtener las cuentas del usuario");
    }

    const cuentas = await resp.json();

    if (!Array.isArray(cuentas) || cuentas.length === 0) {
      selectCuenta.innerHTML = `<option value="">No tienes cuentas asociadas</option>`;
      return;
    }

    // Limpio y agrego la opción por defecto
    selectCuenta.innerHTML = `<option value="">-- Seleccione una cuenta --</option>`;

    // Suponiendo que el backend devuelve algo así:
    // { idCuenta: 1, numeroCuenta: "123-456-789", saldo: 1000, tipoCuenta: "Ahorros", ... }
    cuentas.forEach(cuenta => {
      const option = document.createElement("option");
      option.value = cuenta.idCuenta; // ESTE es el valor que mandaremos al backend
      option.textContent = `${cuenta.numeroCuenta} (${cuenta.tipoCuenta ?? ""} - ${cuenta.tipoMoneda ?? ""})`;
      selectCuenta.appendChild(option);
    });
  } catch (err) {
    console.error(err);
    alert("Ocurrió un error cargando tus cuentas. Intenta de nuevo más tarde.");
    selectCuenta.innerHTML = `<option value="">Error al cargar las cuentas</option>`;
  }
}

// -----------------------------
// Envío del formulario
// -----------------------------
async function manejarSubmitTarjeta(e) {
  e.preventDefault();

  const usuario = obtenerUsuarioEnSesion();
  if (!usuario) {
    alert("No hay sesión activa. Vuelve a iniciar sesión.");
    return;
  }

  // 1. Capturar datos del formulario
  const numero = document.getElementById("numTarjeta").value.trim();
  const fecha = document.getElementById("fechaExp").value;
  const cvv = document.getElementById("cvv").value.trim();
  const pin = document.getElementById("pin").value.trim();
  const emisor = parseInt(document.getElementById("emisor").value);
  const tipo = parseInt(document.getElementById("tipoTarjeta").value);
  const idCuentaSeleccionada = document.getElementById("idCuenta").value;

  // 2. Validaciones básicas
  if (numero.length !== 16) {
    alert("El número de tarjeta debe tener 16 dígitos");
    return;
  }

  if (!idCuentaSeleccionada) {
    alert("Debes seleccionar una cuenta asociada");
    return;
  }

  // 3. Construyo el objeto que espera el backend
  const data = {
    numeroTarjeta: numero,
    fechaExpiracion: fecha,
    cvv: cvv,
    pin: pin,
    idEmisor: emisor,
    idTipoTarjeta: tipo,
    idCuenta: parseInt(idCuentaSeleccionada, 10) // se envía el ID, no el número
  };

  try {
    const resp = await fetch(`${API_BASE_URL}/tarjetas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${usuario.token}`
      },
      body: JSON.stringify(data)
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(text || "Error al crear la tarjeta");
    }

    alert("✅ ¡Tarjeta creada con éxito!");
    window.location.href = "Consultar_Tarjetas.html";
  } catch (err) {
    console.error("Error al crear tarjeta:", err);
    alert("Ocurrió un error creando la tarjeta. Revisa la consola para más detalles.");
  }
}