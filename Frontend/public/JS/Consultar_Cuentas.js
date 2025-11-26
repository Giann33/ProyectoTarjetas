document.addEventListener("DOMContentLoaded", () => {
  const baseUrl = "http://localhost:8081"; // ajusta si tu backend usa otro puerto/URL

  // ====== ELEMENTOS DEL DOM ======
  const rolePill = document.getElementById("rolePill");

  // Info de usuario/persona (solo lectura)
  const spanIdUsuario = document.getElementById("info-idUsuario");
  const spanNombre = document.getElementById("info-nombre");
  const spanApellido1 = document.getElementById("info-apellido1");
  const spanApellido2 = document.getElementById("info-apellido2");
  const spanCorreo = document.getElementById("info-correo");
  const spanGenero = document.getElementById("info-genero");
  const spanRol = document.getElementById("info-rol");

  // Cuentas
  const contenedorCuentas = document.getElementById("cuentas-container");
  const sinCuentasMsg = document.getElementById("sin-cuentas-msg");

  // Panel administrador
  const adminPanel = document.getElementById("admin-panel");
  const adminUserIdInput = document.getElementById("adminUserId");
  const btnAdminCargar = document.getElementById("btn-admin-cargar");

  // =======================
  //  Helpers para auth (copiados de editar_cuentas.js)
  // =======================

  // Busca en TODO el localStorage un objeto con idUsuario
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

  let idUsuarioActual = obtenerIdUsuario();
  const rolActual = obtenerRolUsuario(); // 1 = admin, 2 = usuario, etc.

  console.log("idUsuarioActual (consultar):", idUsuarioActual, "rolActual:", rolActual);

  if (!idUsuarioActual || !Number.isFinite(idUsuarioActual)) {
    console.warn("No se encontró idUsuario en el localStorage.");
    if (sinCuentasMsg) {
      sinCuentasMsg.classList.remove("hidden");
      sinCuentasMsg.textContent = "No se pudo determinar el usuario actual.";
    }
    return;
  }

  // Rol en el pill
  if (rolePill) {
    rolePill.textContent = rolActual === 1 ? "Rol: Administrador" : "Rol: Usuario";
  }

  // Si es admin, mostramos el panel y dejamos el id por defecto
  if (rolActual === 1 && adminPanel) {
    adminPanel.classList.remove("hidden");
    if (adminUserIdInput) {
      adminUserIdInput.value = idUsuarioActual;
    }
  }

  // =======================
  //  CONSULTA DE USUARIO
  // =======================

  async function cargarUsuario(idUsuario) {
    try {
      const resp = await fetch(`${baseUrl}/api/usuarios/${idUsuario}`);
      if (!resp.ok) {
        console.warn("No se pudo obtener usuario:", resp.status);
        pintarUsuario(null, idUsuario);
        return;
      }
      const usuario = await resp.json();
      console.log("Usuario consultado:", usuario);
      pintarUsuario(usuario, idUsuario);
    } catch (e) {
      console.error("Error consultando usuario:", e);
      pintarUsuario(null, idUsuario);
    }
  }

  function pintarUsuario(usuario, idUsuario) {
    if (spanIdUsuario) spanIdUsuario.textContent = idUsuario ?? "—";

    if (!usuario) {
      if (spanNombre) spanNombre.textContent = "No disponible";
      if (spanApellido1) spanApellido1.textContent = "No disponible";
      if (spanApellido2) spanApellido2.textContent = "No disponible";
      if (spanCorreo) spanCorreo.textContent = "No disponible";
      if (spanGenero) spanGenero.textContent = "No disponible";
      if (spanRol) spanRol.textContent = "No disponible";
      return;
    }

    if (spanNombre) spanNombre.textContent = usuario.nombre ?? "—";
    if (spanApellido1) spanApellido1.textContent = usuario.apellido ?? "—";
    if (spanApellido2) spanApellido2.textContent = usuario.apellido2 ?? "—";
    if (spanCorreo) spanCorreo.textContent = usuario.correo ?? "—";

    if (spanGenero) {
  if (usuario.idGenero != null) {
    if (usuario.idGenero == 1) {
      spanGenero.textContent = "Masculino";
    } else if (usuario.idGenero == 2) {
      spanGenero.textContent = "Femenino";
    } else {
      spanGenero.textContent = "Otro / No definido";
    }
  } else {
    spanGenero.textContent = "—";
  }
}

    const roleId = Number(
      usuario?.idRol ??
      usuario?.rolId ??
      usuario?.catalogo_rol_usuario_idRol ??
      usuario?.rol?.id
    );
    if (spanRol) {
      if (Number.isFinite(roleId)) {
        spanRol.textContent = roleId === 1 ? "Administrador" : "Usuario";
      } else {
        spanRol.textContent = "—";
      }
    }
  }

  // =======================
  //  CONSULTA DE CUENTAS
  // =======================

  async function cargarCuentas(idUsuario) {
    if (!idUsuario || !Number.isFinite(idUsuario)) {
      if (sinCuentasMsg) {
        sinCuentasMsg.classList.remove("hidden");
        sinCuentasMsg.textContent = "idUsuario inválido.";
      }
      if (contenedorCuentas) contenedorCuentas.innerHTML = "";
      return;
    }

    try {
      if (sinCuentasMsg) sinCuentasMsg.classList.add("hidden");
      if (contenedorCuentas) contenedorCuentas.innerHTML = "<p>Cargando cuentas...</p>";

      const url = `${baseUrl}/api/cuentas/por-usuario/${idUsuario}`; // mismo endpoint que Editar_Cuentas
      console.log("GET cuentas (consultar):", url);

      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(`Error al cargar cuentas: ${resp.status}`);
      }

      const cuentas = await resp.json();
      console.log("Cuentas obtenidas:", cuentas);
      pintarCuentas(cuentas);
    } catch (err) {
      console.error("Error cargando cuentas:", err);
      if (sinCuentasMsg) {
        sinCuentasMsg.classList.remove("hidden");
        sinCuentasMsg.textContent =
          "Ocurrió un error al cargar las cuentas. Intenta nuevamente más tarde.";
      }
      if (contenedorCuentas) contenedorCuentas.innerHTML = "";
    }
  }

  function pintarCuentas(cuentas) {
    if (!contenedorCuentas) return;

    contenedorCuentas.innerHTML = "";

    if (!Array.isArray(cuentas) || cuentas.length === 0) {
      if (sinCuentasMsg) {
        sinCuentasMsg.classList.remove("hidden");
        sinCuentasMsg.textContent = "No se encontraron cuentas para este usuario.";
      }
      return;
    }

    if (sinCuentasMsg) sinCuentasMsg.classList.add("hidden");

    cuentas.forEach((cuenta) => {
      // Valor REAL que viene de la BD
      const numeroCuentaReal = cuenta.numeroCuenta ?? "";

      // Texto que se muestra en pantalla
      const numeroCuentaTexto = numeroCuentaReal || "N/D";

      // Saldo numérico de la cuenta
      const saldo = cuenta.saldo ?? 0;

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
      `;

      contenedorCuentas.appendChild(card);
    });
  }

  // =======================
  //  Eventos panel admin
  // =======================

  if (btnAdminCargar) {
    btnAdminCargar.addEventListener("click", () => {
      const valor = adminUserIdInput?.value.trim();
      const id = valor ? Number(valor) : idUsuarioActual;

      if (!Number.isFinite(id) || id <= 0) {
        alert("Ingresa un idUsuario válido.");
        return;
      }

      cargarUsuario(id);
      cargarCuentas(id);
    });
  }

  // =======================
  //  Primera carga (usuario actual)
  // =======================

  cargarUsuario(idUsuarioActual);
  cargarCuentas(idUsuarioActual);
});