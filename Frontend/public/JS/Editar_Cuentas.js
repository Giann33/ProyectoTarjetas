document.addEventListener("DOMContentLoaded", () => {
  const baseUrl = "http://localhost:8081"; // ajusta si tu backend usa otro puerto/URL

  const contenedorCuentas = document.getElementById("cuentas-container");
  const sinCuentasMsg = document.getElementById("sin-cuentas-msg");
  const editSection = document.getElementById("edit-section");
  const formEditar = document.getElementById("form-editar-cuenta");

  const inputNumeroCuenta = document.getElementById("numeroCuenta");
  const inputTipoCuenta = document.getElementById("tipoCuenta");
  const inputMoneda = document.getElementById("moneda");
  const inputSucursal = document.getElementById("sucursal");
  const inputSaldo = document.getElementById("saldo");

  const btnCancelar = document.getElementById("btn-cancelar");

  // Panel admin
  const adminPanel = document.getElementById("admin-panel");
  const adminUserIdInput = document.getElementById("adminUserId");
  const btnAdminCargar = document.getElementById("btn-admin-cargar");

  // =======================
  //  Helpers para auth
  // =======================

  // Igual que en agregar_cuentas: busca en TODO el localStorage un objeto con idUsuario
  function obtenerAuthObjeto() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      try {
        const obj = JSON.parse(raw);
        if (obj && typeof obj === "object" && "idUsuario" in obj) {
          console.log(`Objeto auth encontrado en localStorage["${key}"]:`, obj);
          return obj;
        }
      } catch (e) {
        // No era JSON, lo ignoramos
      }
    }

    console.warn("No se encontró ningún objeto con 'idUsuario' en localStorage.");
    return null;
  }

  function obtenerIdUsuarioDesdeObj(obj) {
    if (!obj) return null;
    const posibles = [
      obj.idUsuario,
      obj.idPersona,
      obj.usuario?.idUsuario,
      obj.usuario?.idPersona,
      obj.user?.idUsuario,
      obj.user?.idPersona,
    ];
    for (const v of posibles) {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
    return null;
  }

  function obtenerRolDesdeObj(obj) {
    if (!obj) return null;
    const posibles = [
      obj.idRol,
      obj.rol,
      obj.usuario?.idRol,
      obj.user?.idRol,
    ];
    for (const v of posibles) {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
    return null;
  }

  function obtenerIdUsuario() {
    const obj = obtenerAuthObjeto();
    const desdeObj = obtenerIdUsuarioDesdeObj(obj);
    if (Number.isFinite(desdeObj)) return desdeObj;

    // Fallback por si algún día guardas el id plano
    const clavesSimples = ["idUsuario", "idPersona", "usuarioId", "userId", "id_user"];
    for (const k of clavesSimples) {
      const v = localStorage.getItem(k);
      if (v != null) {
        const n = Number(v);
        if (Number.isFinite(n)) {
          console.log(`idUsuario obtenido de localStorage["${k}"] =`, n);
          return n;
        }
      }
    }

    console.warn("No se encontró idUsuario en el localStorage.");
    return null;
  }

  function obtenerRolUsuario() {
    const obj = obtenerAuthObjeto();
    const desdeObj = obtenerRolDesdeObj(obj);
    if (Number.isFinite(desdeObj)) return desdeObj;

    // Fallback si algún día guardas el rol plano
    const clavesRolSimples = ["idRol"];
    for (const k of clavesRolSimples) {
      const v = localStorage.getItem(k);
      if (v != null) {
        const n = Number(v);
        if (Number.isFinite(n)) {
          console.log(`idRol obtenido de localStorage["${k}"] =`, n);
          return n;
        }
      }
    }

    // Si no hay rol, por ahora tratamos como admin (para que funcione el panel)
    console.warn("No se encontró rol en localStorage. Se usará rol = 1 (admin) por defecto.");
    return 1;
  }

  // =======================
  //  Estado actual
  // =======================

  
  let numeroCuentaOriginal = null;
  let idUsuarioActual = obtenerIdUsuario();
  const rolActual = obtenerRolUsuario(); // 1 = admin, 2 = usuario, etc.

  console.log("idUsuarioActual:", idUsuarioActual, "rolActual:", rolActual);

  if (!idUsuarioActual || !Number.isFinite(idUsuarioActual)) {
    console.warn("No se encontró idUsuario en el localStorage.");
    sinCuentasMsg.classList.remove("hidden");
    sinCuentasMsg.textContent = "No se pudo determinar el usuario actual.";
    return;
  }

  // Si es admin, mostramos el panel y dejamos el id por defecto
  if (rolActual === 1 && adminPanel) {
    adminPanel.classList.remove("hidden");
    if (adminUserIdInput) {
      adminUserIdInput.value = idUsuarioActual; // pre-carga el usuario actual
    }
  }

  // =======================
  //  Cargar cuentas
  // =======================

  async function cargarCuentas(idUsuario) {
    if (!idUsuario || !Number.isFinite(idUsuario)) {
      sinCuentasMsg.classList.remove("hidden");
      sinCuentasMsg.textContent = "idUsuario inválido.";
      contenedorCuentas.innerHTML = "";
      return;
    }

    try {
      sinCuentasMsg.classList.add("hidden");
      contenedorCuentas.innerHTML = "<p>Cargando cuentas...</p>";
      editSection.classList.add("hidden");

      // Ajusta esta URL a tu endpoint real
      const url = `${baseUrl}/api/cuentas/por-usuario/${idUsuario}`;
      const resp = await fetch(url);

      if (!resp.ok) {
        throw new Error(`Error al cargar cuentas: ${resp.status}`);
      }

      const cuentas = await resp.json();
      pintarCuentas(cuentas);
    } catch (err) {
      console.error(err);
      contenedorCuentas.innerHTML = "";
      sinCuentasMsg.classList.remove("hidden");
      sinCuentasMsg.textContent =
        "Ocurrió un error al cargar las cuentas. Intenta nuevamente más tarde.";
    }
  }

  function pintarCuentas(cuentas) {
    contenedorCuentas.innerHTML = "";

    if (!Array.isArray(cuentas) || cuentas.length === 0) {
      sinCuentasMsg.classList.remove("hidden");
      sinCuentasMsg.textContent = "No se encontraron cuentas para este usuario.";
      return;
    }

    sinCuentasMsg.classList.add("hidden");

  cuentas.forEach((cuenta) => {
  // Valor REAL que viene de la BD
  const numeroCuentaReal = cuenta.numeroCuenta ?? "";

  // Texto que se muestra en pantalla
  const numeroCuentaTexto = numeroCuentaReal || "N/D";

  // Saldo numérico de la cuenta
  const saldo = cuenta.saldo ?? 0; // por si viene null

  // Si quieres, lo formateas (opcional)
  const saldoTexto = saldo; // o por ejemplo: saldo.toFixed(2)

  let tipoCuenta;
  if (cuenta.idTipoCuenta == 1) {
    tipoCuenta = "Ahorros";
  } else if (cuenta.idTipoCuenta == 2) {
    tipoCuenta = "Corriente";
  } else {
    tipoCuenta = "N/D";
  }

  let moneda;
  if (cuenta.idTipoMoneda == 1) {
    moneda = "Colones";
  } else if (cuenta.idTipoMoneda == 2) {
    moneda = "Dólares";
  } else {
    moneda = "N/D";
  }

  let sucursal;
  if (cuenta.sucursal == 1) {
    sucursal = "Central";
  } else if (cuenta.sucursal == 2) {
    sucursal = "Heredia";
  } else if (cuenta.sucursal == 3) {
    sucursal = "Cartago";
  } else {
    sucursal = "N/D";
  }

  const card = document.createElement("article");
  card.className = "cuenta-card";

  card.innerHTML = `
    <div class="cuenta-header">
      <h4>${tipoCuenta}</h4>
      <span class="cuenta-moneda">${moneda}</span>
    </div>
    <p class="cuenta-numero">
      <span>N° de cuenta:</span> ${numeroCuentaTexto}
    </p>
    <p class="cuenta-saldo">
      <span>Saldo:</span> ${saldoTexto}
    </p>
    <p class="cuenta-sucursal">
      <span>Sucursal:</span> ${sucursal}
    </p>
    <div class="cuenta-actions">
      <!-- Aquí va SIEMPRE el valor REAL, no "N/D" -->
      <button class="btn-small btn-edit-card"
              data-numero="${numeroCuentaReal}">
        <i class="fa-solid fa-pen-to-square"></i> Editar
      </button>
    </div>
  `;

  contenedorCuentas.appendChild(card);
});

    contenedorCuentas
      .querySelectorAll(".btn-edit-card")
      .forEach((btn) =>
        btn.addEventListener("click", () => {
          const numero = btn.getAttribute("data-numero");
          seleccionarCuenta(numero, this.cuenta);
        })
      );
  }





function seleccionarCuenta(numeroCuenta, cuentas) {

    numeroCuentaOriginal = numeroCuenta;
   console.log("numeroCuentaOriginal:", numeroCuentaOriginal);

  const card = Array.from(
    contenedorCuentas.querySelectorAll(".cuenta-card")
  ).find((c) =>
    c
      .querySelector(".btn-edit-card")
      ?.getAttribute("data-numero") === numeroCuenta
  );

  if (!card) return;

  // Texto que viene de la tarjeta
  const tipo = card.querySelector("h4")?.textContent?.trim() || "";
  const monedaTexto = card.querySelector(".cuenta-moneda")?.textContent?.trim() || "";
  const saldoTexto = card.querySelector(".cuenta-saldo")?.textContent || "";
  const sucursalTexto = card
    .querySelector(".cuenta-sucursal")
    ?.textContent?.replace("Sucursal:", "")
    .trim() || "";

  // ==========================
  // Mapeo sucursal: texto → id
  // ==========================
  let sucursalValue = "";
  if (sucursalTexto === "Central") {
    sucursalValue = "1";
  } else if (sucursalTexto === "Heredia") {
    sucursalValue = "2";
  } else if (sucursalTexto === "Cartago") {
    sucursalValue = "3";
  }

let tipoCuenta = "";



const tipoLower = tipo.toLowerCase();

if (tipoLower.includes("ahorro")) {
    tipoCuenta = "1";
} else if (tipoLower.includes("corriente") || tipoLower.includes("ahorros")) {
    tipoCuenta = "2";
} 

  // ==========================
  // Mapeo moneda: texto → id
  // ==========================
  let monedaValue = "";
  const monedaLower = monedaTexto.toLowerCase();
  if (monedaLower.includes("colones")) {
    monedaValue = "1";
  } else if (monedaLower.includes("dólares") || monedaLower.includes("dolares")) {
    monedaValue = "2";
  }

  // Extraer número del saldo
  const saldoExtraido = extraerNumero(saldoTexto);

  // Rellenar el formulario de edición
  inputNumeroCuenta.value = numeroCuenta || "";
  inputTipoCuenta.value = tipoCuenta;
  inputMoneda.value = monedaValue;   // ← aquí ya va el id (1 o 2)
  inputSucursal.value = sucursalValue; // ← aquí ya va el id (1,2,3)
  inputSaldo.value = saldoExtraido ?? "";

  editSection.classList.remove("hidden");
  editSection.scrollIntoView({ behavior: "smooth", block: "start" });
}





  function extraerNumero(texto) {
    const match = texto.match(/([-+]?\d+(\.\d+)?)/);
    return match ? Number(match[1]) : null;
  }

  // Guardar cambios
formEditar?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!numeroCuentaOriginal) {
    alert("No se pudo determinar la cuenta original a editar.");
    return;
  }

  const numeroCuentaNuevo = (inputNumeroCuenta.value || "").trim();
  const tipoCuenta = Number(inputTipoCuenta.value);
  const moneda = Number(inputMoneda.value);
  const sucursal = Number(inputSucursal.value);

  const payload = {
    numeroCuentaNuevo: numeroCuentaNuevo,
    idTipoCuenta: tipoCuenta,
    idTipoMoneda: moneda,
    sucursal: sucursal,
    idUsuario:
      rolActual === 1 && adminUserIdInput?.value
        ? Number(adminUserIdInput.value)
        : null,
  };

  console.log("URL PUT:", `${baseUrl}/api/cuentas/${numeroCuentaOriginal}`);
  console.log("Payload PUT:", payload);

  try {
    const resp = await fetch(
      `${baseUrl}/api/cuentas/${encodeURIComponent(numeroCuentaOriginal)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!resp.ok) {
      throw new Error(`Error al actualizar la cuenta: ${resp.status}`);
    }

    alert("Cuenta actualizada correctamente.");
    // ocultar formulario, recargar cuentas, etc.
  } catch (err) {
    console.error("Error al actualizar la cuenta:", err);
    alert("Ocurrió un error al guardar los cambios.");
  }
});

  btnCancelar?.addEventListener("click", () => {
    editSection.classList.add("hidden");
    formEditar.reset();
  });

  // =======================
  //  Eventos panel admin
  // =======================

  btnAdminCargar?.addEventListener("click", () => {
    const valor = adminUserIdInput.value.trim();
    const id = valor ? Number(valor) : idUsuarioActual;
    if (!Number.isFinite(id) || id <= 0) {
      alert("Ingresa un idUsuario válido.");
      return;
    }
    cargarCuentas(id);
  });

  // =======================
  //  Primera carga
  // =======================

  if (rolActual === 1 && adminUserIdInput?.value) {
    cargarCuentas(Number(adminUserIdInput.value));
  } else {
    cargarCuentas(idUsuarioActual);
  }
});