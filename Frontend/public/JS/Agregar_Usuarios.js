document.addEventListener("DOMContentLoaded", () => {
  const baseUrl = "http://localhost:8081";
  const rolePill = document.getElementById("rolePill");

  // Leer la sesión
  const raw = localStorage.getItem("user");
  if (!raw) {
    alert("No se encontró sesión. Inicia sesión de nuevo.");
    window.location.href = "login.html";
    return;
  }

  const session = JSON.parse(raw);
  let { token, idRol } = session;
  idRol = Number(idRol) || null;

  // Mostrar rol
  const setRoleUI = (roleId) => {
    const isAdmin = Number(roleId) === 1;
    document.body.classList.toggle("is-admin", isAdmin);

    if (rolePill) {
      rolePill.textContent = `Rol: ${isAdmin ? "Administrador" : "Usuario"}`;
    }
  };

  setRoleUI(idRol);

  // Solo admin puede crear usuarios
  if (idRol !== 1) {
    alert("Solo los administradores pueden agregar usuarios.");
    history.back();
    return;
  }

  const headersJson = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const form = document.getElementById("registro-form");
  if (!form) {
    console.error("No se encontró el formulario #registro-form");
    return;
  }

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault(); // <- evita que la página se recargue
    console.log("Submit crear usuario...");

    const nombre     = (document.getElementById("nombre")?.value || "").trim();
    const apellidos  = (document.getElementById("apellidos")?.value || "").trim();
    const correo     = (document.getElementById("correo")?.value || "").trim();
    const contrasena = (document.getElementById("contrasena")?.value || "").trim();
    const generoRaw  = document.getElementById("genero")?.value || "";
    const rolRaw     = document.getElementById("rolSelect")?.value || "";

    if (!nombre || !apellidos || !correo || !contrasena || !generoRaw || !rolRaw) {
      alert("Por favor completa todos los campos.");
      return;
    }

    const toNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const payload = {
      nombre,
      apellido: apellidos,
      correo,
      contrasenna: contrasena,   // coincide con tu DTO CrearUsuarioRequest
      idGenero: toNum(generoRaw),
      idRol: toNum(rolRaw),
      activo: true
    };

    console.log("Payload a enviar:", payload);

    try {
      const resp = await fetch(`${baseUrl}/api/usuarios`, {
        method: "POST",
        headers: headersJson,
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const msg = await resp.text();
        console.error("Respuesta no OK:", resp.status, msg);
        alert(`No se pudo crear el usuario: ${resp.status}`);
        return;
      }

      const data = await resp.json();
      console.log("Usuario creado:", data);
      alert("Usuario creado correctamente.");
      form.reset(); // aquí sí se limpian los campos PERO con alerta
    } catch (err) {
      console.error("Error en la petición:", err);
      alert("Ocurrió un error al enviar la solicitud.");
    }
  });

  document.getElementById("btnCancelar")?.addEventListener("click", () => {
    history.back();
  });
});