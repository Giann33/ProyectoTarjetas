document.addEventListener("DOMContentLoaded", () => {
  const baseUrl = "http://localhost:8081"; // mismo backend que en Agregar

  const contenedorCuentas = document.getElementById("cuentas-container");
  const sinCuentasMsg = document.getElementById("sin-cuentas-msg");

  // Panel admin
  const adminPanel = document.getElementById("admin-panel");
  const adminUserIdInput = document.getElementById("adminUserId");
  const btnAdminCargar = document.getElementById("btn-admin-cargar");

  // Acciones masivas
  const btnEliminarSeleccionadas = document.getElementById("btn-eliminar-seleccionadas");

  // =======================
  //  Helpers para auth
  // =======================

  function obtenerAuthObjeto() {
    const clavesObjetos = ["userData", "user", "auth", "loginData"];

    for (const k of clavesObjetos) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;

      try {
        const obj = JSON.parse(raw);
        return obj;
      } catch (e) {
        console.error(`No se pudo parsear el JSON de localStorage["${k}"]`, e);
      }
    }
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
    const clavesSimples = ["idUsuario", "idPersona", "usuarioId", "userId", "id_user"];
    for (const k of clavesSimples) {
      const v = localStorage.getItem(k);
      if (v != null) {
        const n = Number(v);
        if (Number.isFinite(n)) {
          return n;
        }
      }
    }
    const obj = obtenerAuthObjeto();
    return obtenerIdUsuarioDesdeObj(obj);
  }

  function obtenerRolUsuario() {
    const clavesRolSimples = ["idRol", "rol", "userRole"];
    for (const k of clavesRolSimples) {
      const v = localStorage.getItem(k);
      if (v != null) {
        const n = Number(v);
        if (Number.isFinite(n)) return n;
      }
    }
    const obj = obtenerAuthObjeto();
    return obtenerRolDesdeObj(obj);
  }

  // =======================
  //  Estado actual
  // =======================

  let idUsuarioActual = obtenerIdUsuario();
  const rolActual = obtenerRolUsuario(); // 1 = admin, 2 = usuario

  console.log("idUsuarioActual:", idUsuarioActual, "rolActual:", rolActual);

  if (!idUsuarioActual || !Number.isFinite(idUsuarioActual)) {
    console.warn("No se encontró idUsuario en el localStorage.");
    sinCuentasMsg.classList.remove("hidden");
    sinCuentasMsg.textContent = "No se pudo determinar el usuario actual.";
    return;
  }

  // Mostrar panel admin para rol 1
  if (rolActual === 1 && adminPanel) {
    adminPanel.classList.remove("hidden");
    if (adminUserIdInput) {
      adminUserIdInput.value = idUsuarioActual;
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
      const numeroCuenta = cuenta.numeroCuenta || "N/D";
      const saldo = cuenta.saldo;

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
          <span>N° de cuenta:</span> ${numeroCuenta}
        </p>
        <p class="cuenta-saldo">
          <span>Saldo:</span> ${saldo}
        </p>
        <p class="cuenta-sucursal">
          <span>Sucursal:</span> ${sucursal}
        </p>
        <div class="cuenta-footer">
          <div class="cuenta-footer-left">
            <input type="checkbox" class="chk-cuenta" data-numero="${numeroCuenta}">
            <span>Seleccionar</span>
          </div>
          <button class="btn-small btn-delete-card" data-numero="${numeroCuenta}">
            <i class="fa-solid fa-trash"></i> Eliminar
          </button>
        </div>
      `;

      contenedorCuentas.appendChild(card);
    });

    // Eventos de eliminación individual
    contenedorCuentas
      .querySelectorAll(".btn-delete-card")
      .forEach((btn) =>
        btn.addEventListener("click", () => {
          const numero = btn.getAttribute("data-numero");
          eliminarUnaCuenta(numero);
        })
      );
  }

  // =======================
  //  Eliminar cuentas
  // =======================

  async function eliminarUnaCuenta(numeroCuenta) {
    if (!numeroCuenta) return;

    const confirmado = confirm(
      `¿Seguro que deseas eliminar la cuenta ${numeroCuenta}?`
    );
    if (!confirmado) return;

    try {
      // 👈 aquí corregimos el endpoint
      const url = `${baseUrl}/api/cuentas/${encodeURIComponent(numeroCuenta)}`;
      const resp = await fetch(url, {
        method: "DELETE",
      });

      if (!resp.ok) {
        throw new Error(`Error al eliminar la cuenta: ${resp.status}`);
      }

      alert(`Cuenta ${numeroCuenta} eliminada correctamente.`);

      const idParaRecargar =
        (rolActual === 1 && adminUserIdInput?.value)
          ? Number(adminUserIdInput.value)
          : idUsuarioActual;

      cargarCuentas(idParaRecargar);
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al eliminar la cuenta.");
    }
  }

  async function eliminarSeleccionadas() {
    const checks = Array.from(
      contenedorCuentas.querySelectorAll(".chk-cuenta:checked")
    );
    if (!checks.length) {
      alert("Selecciona al menos una cuenta para eliminar.");
      return;
    }

    const numeros = checks.map((c) => c.getAttribute("data-numero"));

    const confirmado = confirm(
      `Se eliminarán ${numeros.length} cuentas:\n\n${numeros.join(
        "\n"
      )}\n\n¿Deseas continuar?`
    );
    if (!confirmado) return;

    try {
      // De momento, las eliminamos una por una
      for (const n of numeros) {
        const url = `${baseUrl}/api/cuentas/${encodeURIComponent(n)}`;
        const resp = await fetch(url, { method: "DELETE" });
        if (!resp.ok) {
          console.warn(`Error al eliminar cuenta ${n}:`, resp.status);
        }
      }

      alert("Operación de eliminación masiva finalizada.");

      const idParaRecargar =
        (rolActual === 1 && adminUserIdInput?.value)
          ? Number(adminUserIdInput.value)
          : idUsuarioActual;

      cargarCuentas(idParaRecargar);
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al eliminar las cuentas seleccionadas.");
    }
  }

  // =======================
  //  Eventos de UI
  // =======================

  btnEliminarSeleccionadas?.addEventListener("click", eliminarSeleccionadas);

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