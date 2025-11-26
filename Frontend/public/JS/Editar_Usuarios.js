document.addEventListener("DOMContentLoaded", async () => {

  const baseUrl = "http://localhost:8081"; 
  const rolePill = document.getElementById("rolePill");

  const adminPanel = document.getElementById("admin-panel");
  const adminUserIdInput = document.getElementById("adminUserId");
  const btnAdminCargar = document.getElementById("btn-admin-cargar");

  const raw = localStorage.getItem("user");
  if (!raw) return;
  const session = JSON.parse(raw);

  let { idUsuario, personaId, token, idRol } = session;
  idUsuario = Number(idUsuario) || null;
  personaId = Number(personaId) || null;
  idRol = Number(idRol) || null;

  let idUsuarioActual = idUsuario;

  const headersGet = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const headersJson = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  // === Mostrar/Ocultar contenido según Rol ===
  const setRoleUI = (roleId) => {
    const isAdmin = Number(roleId) === 1;

    document.body.classList.toggle("is-admin", isAdmin);

    if (rolePill) {
      rolePill.textContent = `Rol: ${isAdmin ? "Administrador" : "Usuario"}`;
    }

    if (adminPanel) adminPanel.classList.toggle("hidden", !isAdmin);

    const rolSelect = document.getElementById("rolSelect");
    if (rolSelect) rolSelect.disabled = !isAdmin;
  };

  setRoleUI(0);

  if (Number.isFinite(idRol) && idRol > 0) {
    setRoleUI(idRol);
  }

  if (!idUsuarioActual) return;

  // ============================================================
  // FUNCIÓN PARA POBLAR FORMULARIO
  // ============================================================

  const poblarFormularioDesdeUsuario = (usuarioObj) => {
  if (!usuarioObj) return;

  const nombreInput     = document.getElementById("nombre");
  const apellidosInput  = document.getElementById("apellidos");
  const correoInput     = document.getElementById("correo");
  const contrasenaInput = document.getElementById("contrasena");
  const generoSelect    = document.getElementById("genero");
  const rolSelect = document.getElementById("rolSelect");

  const idField         = document.getElementById("idUsuarioField");

  // Nombre y apellidos vienen separados
  if (nombreInput)    nombreInput.value    = usuarioObj.nombre   ?? "";
  if (apellidosInput) apellidosInput.value = usuarioObj.apellido ?? usuarioObj.apellidos ?? "";

  if (correoInput) correoInput.value = usuarioObj.correo ?? "";

  // Nunca rellenamos contraseña, solo limpiamos y ponemos placeholder
  if (contrasenaInput) {
    contrasenaInput.value = "";
    contrasenaInput.placeholder = "Ingresa nueva contraseña (opcional)";
  }

  // idGenero: 1 = Masculino, 2 = Femenino (viene como número del backend)
  if (generoSelect && usuarioObj.idGenero != null) {
    generoSelect.value = String(usuarioObj.idGenero);
  } else if (generoSelect) {
    generoSelect.value = "";
  }

  // idRol: 1 = Administrador, 2 = Usuario (solo se ve si es admin, pero igual lo seteamos)
  if (rolSelect) {
  const posibleRol =
    usuarioObj.rolId ??          // 🔹 viene así del backend (UsuarioView)
    usuarioObj.idRol ??
    usuarioObj.rol ??
    usuarioObj.catalogoRolUsuario?.idRol ??
    usuarioObj.catalogoRolUsuario?.rol;

  const roleId = Number(posibleRol);
  if (Number.isFinite(roleId)) {
    rolSelect.value = String(roleId);   // "1" o "2"
  } else {
    rolSelect.value = "";
  }
}

  // Campo admin (idUsuario actual que se está editando)
  if (idField) idField.value = idUsuarioActual;

  // Ajustar personaId si backend lo envía
  if (!personaId && usuarioObj.personaId != null) {
    personaId = Number(usuarioObj.personaId);
    localStorage.setItem("user", JSON.stringify({ ...session, personaId }));
  }
};

  // ============================================================
  // CARGAR USUARIO INICIAL
  // ============================================================

  let usuario = null;
  try {
    const resp = await fetch(`${baseUrl}/api/usuarios/${idUsuarioActual}`, { headers: headersGet });
    if (resp.ok) {
      usuario = await resp.json();

      // Detectar rol desde backend
      if (!idRol && usuario) {
        const posibleRol =
          usuario.idRol ??
          usuario.rol ??
          usuario.catalogoRolUsuario?.idRol ??
          usuario.catalogoRolUsuario?.rol;

        const roleId = Number(posibleRol);
        if (Number.isFinite(roleId)) {
          idRol = roleId;
          setRoleUI(idRol);
          localStorage.setItem("user", JSON.stringify({ ...session, idRol }));
        }
      }

      poblarFormularioDesdeUsuario(usuario);

    }
  } catch (e) {
    console.warn("Error obteniendo usuario:", e);
  }

  // ============================================================
  // ADMIN: cambiar usuario a editar
  // ============================================================

  if (btnAdminCargar && adminUserIdInput) {
    btnAdminCargar.addEventListener("click", async () => {
      const nuevoId = Number(adminUserIdInput.value.trim());
      if (!nuevoId || nuevoId <= 0) {
        alert("Ingresa un idUsuario válido.");
        return;
      }

      try {
        const resp = await fetch(`${baseUrl}/api/usuarios/${nuevoId}`, { headers: headersGet });
        if (!resp.ok) {
          alert("Usuario no encontrado.");
          return;
        }

        const data = await resp.json();
        usuario = data;
        idUsuarioActual = nuevoId;

        poblarFormularioDesdeUsuario(usuario);
        alert(`Usuario ${nuevoId} cargado.`);

      } catch (e) {
        console.error("Error cargando usuario:", e);
      }
    });
  }

  // ============================================================
  // SUBMIT ACTUALIZACIÓN
  // ============================================================
// ============ SUBMIT ============
const form = document.getElementById("registro-form");
form?.addEventListener("submit", async (ev) => {
  ev.preventDefault();

  const nombre      = (document.getElementById("nombre")?.value || "").trim();
  const apellidos   = (document.getElementById("apellidos")?.value || "").trim();
  const correo      = (document.getElementById("correo")?.value || "").trim();
  const contrasena  = (document.getElementById("contrasena")?.value || "").trim();
  const generoRaw   = document.getElementById("genero")?.value || "";
  const rolRaw = document.getElementById("rolSelect")?.value || "";

  const idUsuarioNuevoRaw = document.getElementById("idUsuarioField")?.value || "";

  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const esAdmin        = document.body.classList.contains("is-admin");
  const idUsuarioNuevo = toNum(idUsuarioNuevoRaw);

  // Armamos el payload según lo que soporte tu backend
  const payload = {
    nombre,
    apellido: apellidos,   // aquí mandamos los apellidos
    correo,
    ...(contrasena ? { contrasena } : {}),
    ...(generoRaw ? { idGenero: toNum(generoRaw) } : {}),
    // Solo permitir cambiar el rol si es admin
    ...(rolRaw && esAdmin ? { idRol: toNum(rolRaw) } : {})
  };

  // Si es admin y pidió cambiar el ID, mandamos el nuevo idUsuario
  if (esAdmin && idUsuarioNuevo && idUsuarioNuevo !== idUsuarioActual) {
    payload.idUsuarioNuevo = idUsuarioNuevo; // asegúrate que tu backend lo soporte
  }

  try {
    const url  = `${baseUrl}/api/usuarios/${idUsuarioActual}`;
    const resp = await fetch(url, {
      method: "PUT", // o "PATCH", según tu API
      headers: headersJson,
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const msg = await resp.text();
      alert(`No se pudo actualizar: ${resp.status} ${msg}`);
      return;
    }

    alert("Usuario actualizado correctamente.");
  } catch (err) {
    console.error("Error actualizando usuario:", err);
    alert("Ocurrió un error al actualizar el usuario.");
  }
});

  document.getElementById("btnCancelar")?.addEventListener("click", () => {
    history.back();
  });

  const params = new URLSearchParams(location.search);
  if (params.get("admin") === "1") setRoleUI(1);

});