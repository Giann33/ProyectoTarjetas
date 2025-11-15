document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Agregar_Cuentas.js cargado correctamente");

  const baseUrl = "http://localhost:8081"; // Backend Spring

  // ====== Referencias del DOM ======
  const adminPanel = document.getElementById("admin-panel");
  const adminUserIdInput = document.getElementById("adminUserId");
  const btnAdminUsar = document.getElementById("btn-admin-usar");

  const lblIdUsuarioDestino = document.getElementById("lbl-id-usuario-destino");

  const formAgregar = document.getElementById("form-agregar-cuenta");
  const inputNumeroCuenta = document.getElementById("numeroCuenta");
  const selectTipoCuenta = document.getElementById("tipoCuenta");
  const selectMoneda = document.getElementById("moneda");
  const selectSucursal = document.getElementById("sucursal");
  const inputSaldo = document.getElementById("saldo"); // si no existe, no pasa nada

  const statusSection = document.getElementById("status-section");
  const statusMsg = document.getElementById("status-msg");

  function mostrarEstado(mensaje, tipo = "ok") {
    if (!statusSection || !statusMsg) return;
    statusSection.classList.remove("hidden", "status-ok", "status-error");
    statusSection.classList.add(tipo === "error" ? "status-error" : "status-ok");
    statusMsg.textContent = mensaje;
  }

  // =====================================
  //  1) Obtener usuario desde localStorage
  // =====================================

  function obtenerUsuarioActual() {
    console.log("🔎 Buscando usuario en localStorage...");
    console.log("localStorage keys:", Object.keys(localStorage));

    // Claves típicas donde se suele guardar el usuario
    const posiblesClaves = ["userData", "usuario", "user", "loggedUser", "currentUser"];

    for (const key of posiblesClaves) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      try {
        const obj = JSON.parse(raw);
        console.log(`✅ Encontrado candidato en '${key}':`, obj);
        if (obj && typeof obj === "object" && "idUsuario" in obj) {
          return obj;
        }
      } catch (e) {
        console.warn(`No se pudo parsear '${key}' como JSON`, e);
      }
    }

    // Si no está en esas claves, revisamos TODO el localStorage
    for (const key of Object.keys(localStorage)) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const obj = JSON.parse(raw);
        if (obj && typeof obj === "object" && "idUsuario" in obj) {
          console.log(`✅ Encontrado usuario en clave '${key}':`, obj);
          return obj;
        }
      } catch (e) {
        // no era JSON, lo ignoramos
      }
    }

    console.warn("⚠️ No se encontró un objeto con idUsuario en localStorage");
    return null;
  }

  const usuarioActual = obtenerUsuarioActual();
  console.log("👤 usuarioActual:", usuarioActual);

  let idUsuarioDestino = null;
  let rolActual = null;

  if (usuarioActual) {
    idUsuarioDestino = usuarioActual.idUsuario ?? null;
    rolActual = usuarioActual.idRol ?? null;

    // Convertimos a número por si viniera como string
    if (rolActual != null) {
      rolActual = parseInt(rolActual, 10);
    }
    if (idUsuarioDestino != null) {
      idUsuarioDestino = parseInt(idUsuarioDestino, 10);
    }
  }

  // Si aún así no hay datos, ponemos valores por defecto
  if (!rolActual) {
    console.warn("No se encontró rol, se asume admin (1) por defecto.");
    rolActual = 1;
  }

  if (!idUsuarioDestino) {
    console.warn("No se encontró idUsuario, se deja como null.");
  }

  // Mostrar el idUsuario destino en la interfaz
  if (lblIdUsuarioDestino) {
    lblIdUsuarioDestino.textContent = idUsuarioDestino ?? "-";
  }

  // Mostrar u ocultar panel admin
  if (rolActual === 1 && adminPanel) {
    console.log("🛠 Rol admin detectado, mostrando panel de selección de idUsuario.");
    adminPanel.classList.remove("hidden");
  } else if (adminPanel) {
    console.log("👤 No es admin, se oculta panel de admin.");
    adminPanel.classList.add("hidden");
  }

  // =====================================
  //  2) Panel admin: cambiar idUsuario destino
  // =====================================

  if (btnAdminUsar) {
    btnAdminUsar.addEventListener("click", () => {
      const valor = parseInt(adminUserIdInput.value, 10);
      if (!isNaN(valor) && valor > 0) {
        idUsuarioDestino = valor;
        if (lblIdUsuarioDestino) {
          lblIdUsuarioDestino.textContent = idUsuarioDestino;
        }
        mostrarEstado(`Se utilizará el idUsuario ${idUsuarioDestino} para la nueva cuenta.`, "ok");
      } else {
        mostrarEstado("Debes ingresar un idUsuario válido.", "error");
      }
    });
  }

  // =====================================
  //  3) Enviar formulario para crear cuenta
  // =====================================

  if (formAgregar) {
    formAgregar.addEventListener("submit", async (e) => {
      e.preventDefault();

      const numeroCuenta = inputNumeroCuenta?.value.trim();
      const tipoCuenta = parseInt(selectTipoCuenta?.value, 10);
      const tipoMoneda = parseInt(selectMoneda?.value, 10);
      const sucursal = parseInt(selectSucursal?.value, 10);
      const saldo = inputSaldo && inputSaldo.value
        ? parseFloat(inputSaldo.value)
        : 0;

      if (!numeroCuenta) {
        mostrarEstado("El número de cuenta es obligatorio.", "error");
        return;
      }
      if (!idUsuarioDestino) {
        mostrarEstado("No se pudo determinar el idUsuario destino.", "error");
        return;
      }
      if (isNaN(tipoCuenta) || isNaN(tipoMoneda) || isNaN(sucursal)) {
        mostrarEstado("Debes seleccionar tipo de cuenta, moneda y sucursal.", "error");
        return;
      }

      const payload = {
        numeroCuenta,
        idUsuario: idUsuarioDestino,
        tipoCuenta,
        tipoMoneda,
        sucursal,
        saldo,
      };

      console.log("📤 Enviando payload al backend:", payload);

      try {
        const resp = await fetch(`${baseUrl}/api/cuentas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!resp.ok) {
          const text = await resp.text();
          console.error("Error al crear cuenta", text);
          mostrarEstado(
            "No se pudo crear la cuenta. " + (text || "(Error en el servidor)"),
            "error"
          );
          return;
        }

        const data = await resp.json().catch(() => ({}));
        mostrarEstado(
          `Cuenta creada correctamente${
            data.idCuenta ? ` (idCuenta ${data.idCuenta})` : ""
          }.`,
          "ok"
        );
        

        formAgregar.reset();
        if (lblIdUsuarioDestino) {
          lblIdUsuarioDestino.textContent = idUsuarioDestino;
        }
      } catch (err) {
        console.error(err);
        mostrarEstado("Ocurrió un error inesperado al crear la cuenta.", "error");
      }
    });
  }
});