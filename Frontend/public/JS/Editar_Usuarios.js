document.addEventListener("DOMContentLoaded", async () => {
  // ============ CONFIG ============
  const baseUrl = "http://localhost:8081"; // Ajusta a tu backend
  const rolePill = document.getElementById("rolePill");

  // ============ SESIÓN ============
  const raw = localStorage.getItem("user");
  if (!raw) {
    console.warn("No hay sesión en localStorage['user']");
    // location.href = "index.html";
    return;
  }
  const session = JSON.parse(raw);

  // Extrae datos mínimos
  let { idUsuario, personaId, token, idRol } = session || {};
  idUsuario = Number(idUsuario) || null;
  personaId = Number(personaId) || null;
  idRol = Number(idRol) || null; // puede venir vacío

  // Headers base
  const headersGet = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  const headersJson = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  // ============ UI por ROL ============
  const setRoleUI = (roleId) => {
    const isAdmin = Number(roleId) === 1;  // 1 = admin, 2 = usuario
    document.body.classList.toggle("is-admin", isAdmin);
    if (rolePill) rolePill.textContent = `Rol: ${isAdmin ? "Administrador" : (roleId ? "Usuario" : "—")}`;
    console.log("roleId detectado:", roleId, isAdmin ? "ADMIN" : "USUARIO");
  };

  // Por defecto, modo usuario (oculta admin-only)
  setRoleUI(0);

  // Si ya tienes idRol en la sesión, úsalo inmediato
  if (Number.isFinite(idRol) && idRol > 0) setRoleUI(idRol);

  if (!idUsuario) {
    console.error("idUsuario inválido en sesión. Revisa localStorage['user'].");
    return;
  }

  // ============ OBTENER USUARIO (rol + datos) ============
  let usuario = null;
  try {
    const resp = await fetch(`${baseUrl}/api/usuarios/${idUsuario}`, { headers: headersGet });
    if (resp.ok) {
      usuario = await resp.json();

      // Detecta rol desde respuesta si la sesión no lo tenía
      if (!idRol) {
        const roleId = Number(
          usuario?.idRol ??
          usuario?.rolId ??
          usuario?.catalogo_rol_usuario_idRol ??
          usuario?.rol?.id
        );
        if (Number.isFinite(roleId)) {
          idRol = roleId;
          setRoleUI(idRol);
          // Opcional: persistir el idRol en la sesión local
          localStorage.setItem("user", JSON.stringify({ ...session, idRol }));
        }
      }

      // Poblar formulario
      document.getElementById("nombre").value = usuario.nombre ?? "";
      document.getElementById("correo").value = usuario.correo ?? "";
      document.getElementById("contrasena").placeholder = "Ingresa nueva contraseña (opcional)";

      if (document.getElementById("genero") && (usuario.idGenero != null)) {
        document.getElementById("genero").value = String(usuario.idGenero);
      }

      // Campo admin (idUsuario)
      const idField = document.getElementById("idUsuarioField");
      if (idField) idField.value = idUsuario;

      // Ajustar personaId si backend lo envía
      if (!personaId && usuario.personaId != null) {
        personaId = Number(usuario.personaId);
        localStorage.setItem("user", JSON.stringify({ ...session, personaId }));
      }

    } else {
      console.warn("No se pudo obtener usuario:", resp.status);
    }
  } catch (e) {
    console.warn("Error consultando usuario:", e);
  }

  // ============ SUBMIT ============
  const form = document.getElementById("registro-form");
  form?.addEventListener("submit", async (ev) => {
    ev.preventDefault();

    const nombre = (document.getElementById("nombre")?.value || "").trim();
    const correo = (document.getElementById("correo")?.value || "").trim();
    const contrasena = (document.getElementById("contrasena")?.value || "").trim();
    const generoRaw = document.getElementById("genero")?.value || "";
    const idUsuarioNuevoRaw = document.getElementById("idUsuarioField")?.value || "";

    const toNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const payload = {
      nombre,
      correo,
      ...(contrasena ? { contrasena } : {}),
      ...(generoRaw ? { idGenero: toNum(generoRaw) } : {})
    };

    // Si es admin y pidió cambiar el ID, mandamos la intención
    const esAdmin = document.body.classList.contains("is-admin");
    const idUsuarioNuevo = toNum(idUsuarioNuevoRaw);
    if (esAdmin && idUsuarioNuevo && idUsuarioNuevo !== idUsuario) {
      payload.idUsuarioNuevo = idUsuarioNuevo; // tu backend debe soportarlo
    }

    try {
      const url = `${baseUrl}/api/usuarios/${idUsuario}`;
      const resp = await fetch(url, {
        method: "PUT", // o "PATCH" según tu API
        headers: headersJson,
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const msg = await resp.text();
        alert(`No se pudo actualizar: ${resp.status} ${msg}`);
        return;
      }

      const updated = await resp.json();

      // Si cambió el ID y backend lo confirmó
      if (payload.idUsuarioNuevo && updated?.idUsuario === payload.idUsuarioNuevo) {
        const nuevaSesion = { ...session, idUsuario: payload.idUsuarioNuevo };
        localStorage.setItem("user", JSON.stringify(nuevaSesion));
        alert("Usuario actualizado (incluye cambio de ID). Se actualizó la sesión.");
      } else {
        alert("Usuario actualizado correctamente.");
      }

    } catch (err) {
      console.error(err);
      alert("Error de red actualizando el usuario.");
    }
  });

  // ============ BOTÓN CANCELAR ============
  document.getElementById("btnCancelar")?.addEventListener("click", () => {
    history.back();
  });

  // ============ OVERRIDE DE PRUEBA (opcional) ============
  // Usa ?admin=1 en la URL para forzar la vista admin sin backend
  const params = new URLSearchParams(location.search);
  if (params.get("admin") === "1") setRoleUI(1);
});