document.addEventListener("DOMContentLoaded", () => {
  console.log("Eliminar_Usuarios.js cargado.");

  const baseUrl = "http://localhost:8081";

  // Elementos básicos
  const rolePill       = document.getElementById("rolePill");
  const userNameLabel  = document.getElementById("userNameLabel");

  const inputIdUsuario = document.getElementById("inputIdUsuario");
  const btnCargar      = document.getElementById("btnCargarUsuario");
  const btnEliminar    = document.getElementById("btnConfirmarEliminar");
  const btnCancelar    = document.getElementById("btnCancelarEliminar");

  const infoCard       = document.getElementById("info-usuario");
  const mensajeInfo    = document.getElementById("mensajeInfo");

  const avatarIniciales = document.getElementById("avatarIniciales");
  const infoNombre      = document.getElementById("infoNombre");
  const infoCorreo      = document.getElementById("infoCorreo");
  const infoIdUsuario   = document.getElementById("infoIdUsuario");
  const infoIdPersona   = document.getElementById("infoIdPersona");
  const infoRol         = document.getElementById("infoRol");
  const estadoPill      = document.getElementById("estadoPill");

  // =======================
  //   SESIÓN / AUTH
  // =======================
  const raw = localStorage.getItem("user");
  if (!raw) {
    alert("No se encontró sesión. Inicia sesión nuevamente.");
    window.location.href = "login.html";
    return;
  }

  const session   = JSON.parse(raw);
  const token     = session.token || session.Token;
  const idRol     = Number(session.idRol ?? session.rolId ?? 0);
  const nombreSes = session.nombre || session.name || "";

  if (userNameLabel && nombreSes) {
    userNameLabel.textContent = nombreSes;
  }

  if (rolePill) {
    if (idRol === 1) {
      rolePill.textContent = "Administrador";
      rolePill.classList.add("role-admin");
    } else if (idRol === 2) {
      rolePill.textContent = "Usuario";
      rolePill.classList.add("role-user");
    } else {
      rolePill.textContent = "Desconocido";
    }
  }

  // Solo admin puede eliminar usuarios
  if (idRol !== 1) {
    alert("Solo los administradores pueden eliminar usuarios.");
    history.back();
    return;
  }

  const headersGet = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const headersJson = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  // Usuario actualmente cargado en la tarjeta
  let usuarioActual = null;

  // =======================
  //   UTILIDADES
  // =======================
  function mostrarMensaje(texto, tipo) {
    if (!mensajeInfo) return;

    if (!texto) {
      mensajeInfo.style.display = "none";
      mensajeInfo.textContent = "";
      mensajeInfo.className = "alert";
      return;
    }

    mensajeInfo.style.display = "block";
    mensajeInfo.textContent = texto;
    mensajeInfo.className = "alert";

    if (tipo === "error") {
      mensajeInfo.classList.add("alert-error");
    } else if (tipo === "success") {
      mensajeInfo.classList.add("alert-success");
    }
  }

  function poblarTarjeta(usuario) {
    if (!usuario) {
      infoCard.style.display = "none";
      return;
    }

    usuarioActual = usuario;

    const nombre   = usuario.nombre || "";
    const apellido = usuario.apellido || usuario.apellidos || "";
    const nombreCompleto = (nombre + " " + apellido).trim() || "Sin nombre";

    infoNombre.textContent    = nombreCompleto;
    infoCorreo.textContent    = usuario.correo || "Sin correo";
    infoIdUsuario.textContent = usuario.idUsuario ?? "-";
    infoIdPersona.textContent = usuario.personaId ?? "-";

    const rolVal = usuario.rolId ?? usuario.idRol ?? usuario.rol;
    let rolTexto = "Sin rol";
    if (rolVal === 1) rolTexto = "Administrador";
    else if (rolVal === 2) rolTexto = "Usuario";
    else if (rolVal != null) rolTexto = `Rol ${rolVal}`;

    infoRol.textContent = rolTexto;

    const iniciales = (nombre.charAt(0) + (apellido.charAt(0) || "")).toUpperCase() || "U";
    avatarIniciales.textContent = iniciales;

    if (usuario.activo === false) {
      estadoPill.textContent = "INACTIVO";
      estadoPill.classList.remove("status-activo");
      estadoPill.classList.add("status-inactivo");
    } else {
      estadoPill.textContent = "ACTIVO";
      estadoPill.classList.remove("status-inactivo");
      estadoPill.classList.add("status-activo");
    }

    infoCard.style.display = "block";
  }

  function limpiarTodo() {
    inputIdUsuario.value = "";
    usuarioActual = null;
    infoCard.style.display = "none";
    mostrarMensaje("", "info");
  }

  // =======================
  //   EVENTOS
  // =======================

  // Botón para cargar datos del usuario
  btnCargar?.addEventListener("click", async () => {
    const rawId = (inputIdUsuario.value || "").trim();
    const id = Number(rawId);

    if (!Number.isFinite(id) || id <= 0) {
      alert("Ingresa un ID de usuario válido.");
      return;
    }

    try {
      mostrarMensaje("Buscando usuario...", "info");

      const resp = await fetch(`${baseUrl}/api/usuarios/${id}`, {
        method: "GET",
        headers: headersGet
      });

      if (!resp.ok) {
        mostrarMensaje("No se encontró un usuario con ese ID.", "error");
        infoCard.style.display = "none";
        return;
      }

      const data = await resp.json();
      poblarTarjeta(data);
      mostrarMensaje("Usuario cargado. Revisa los datos antes de eliminar.", "info");
    } catch (err) {
      console.error("Error cargando usuario:", err);
      mostrarMensaje("Ocurrió un error al buscar el usuario.", "error");
    }
  });

  // Permitir Enter en el input para cargar
  inputIdUsuario?.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      btnCargar?.click();
    }
  });

  // Cancelar selección
  btnCancelar?.addEventListener("click", () => {
    limpiarTodo();
    mostrarMensaje("Selección cancelada. El usuario no fue eliminado.", "info");
  });

  // Confirmar eliminación
  btnEliminar?.addEventListener("click", async () => {
    if (!usuarioActual || !usuarioActual.idUsuario) {
      alert("Primero carga un usuario válido.");
      return;
    }

    const id = usuarioActual.idUsuario;

    const confirmado = confirm(
      `¿Seguro que quieres eliminar al usuario con ID ${id}? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    try {
      const resp = await fetch(`${baseUrl}/api/usuarios/${id}`, {
        method: "DELETE",
        headers: headersJson
      });

      if (!resp.ok && resp.status !== 204) {
        const txt = await resp.text();
        console.error("Error al eliminar usuario:", resp.status, txt);
        alert("No se pudo eliminar el usuario.");
        return;
      }

      alert("Usuario eliminado correctamente.");
      limpiarTodo();
      mostrarMensaje("Usuario eliminado.", "success");
    } catch (err) {
      console.error("Error en DELETE:", err);
      alert("Ocurrió un error al eliminar el usuario.");
    }
  });
});