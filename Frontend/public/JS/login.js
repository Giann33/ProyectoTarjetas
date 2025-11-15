// Frontend/public/JS/login.js

document.addEventListener("DOMContentLoaded", () => {
  const baseUrl = "http://localhost:8081";
  const form = document.getElementById("loginForm");

  // Helper numérico
  const N = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Ajusta los ids de tus inputs:
    const userInput = document.getElementById("correo") ||
                      document.getElementById("email") ||
                      document.getElementById("usuario") ||
                      document.getElementById("username");

    const passInput = document.getElementById("password") ||
                      document.getElementById("contrasena");

    const userValue = (userInput?.value || "").trim();
    const passValue = (passInput?.value || "").trim();

    if (!userValue || !passValue) {
      alert("Completa usuario y contraseña.");
      return;
    }

    // Construimos el payload aceptando email o username
    const payload = { password: passValue };
    if (userValue.includes("@")) {
      payload.email = userValue;
      payload.correo = userValue;
    } else {
      payload.username = userValue;
      payload.usuario  = userValue;
    }

    try {
      const resp = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const tx = await resp.text().catch(() => "");
        console.warn("Login fallido:", resp.status, tx);
        alert("Usuario o contraseña incorrectos.");
        return;
      }

      const data = await resp.json();
      console.log("Respuesta login:", data); // 👈 útil para ver cómo viene el rol

      // =========================
      // Normalizar campos
      // =========================

      const token =
        data.token ??
        data.accessToken ??
        data.jwt ??
        data.id_token ??
        null;

      const idUsuario = N(
        data.idUsuario ??
        data.idCliente ??
        data.usuarioId ??
        data.userId ??
        data.usuario?.idUsuario ??
        data.usuario?.idCliente
      );

      const personaId = N(
        data.personaId ??
        data.persona?.idPersona ??
        data.profile?.personaId
      );

      // 👇 AQUÍ OBTENEMOS EL ROL
      const idRol = N(
        data.idRol ??                 // caso más probable
        data.rol ??                   // si el backend lo llama "rol"
        data.idTipoUsuario ??         // típico con catálogos de tipo usuario
        data.tipoUsuarioId ??         // otra variante
        data.tipoUsuario?.idTipoUsuario ??
        data.usuario?.idRol           // si viene anidado en "usuario"
      );

      // =========================
      // Guardar sesión
      // =========================

      const userObj = {
        idUsuario,
        personaId,
        idRol,   // 👈 ahora también guardamos el rol
        token,
      };

      localStorage.setItem("user", JSON.stringify(userObj));

      // Limpia posibles claves viejas
      localStorage.removeItem("userId");

      console.log("Sesión guardada:", {
        idUsuario,
        personaId,
        idRol,
        token: !!token,
      });

      // Redirige donde corresponda
      window.location.href = "Mantenimientos.html";
    } catch (err) {
      console.error("Error en login:", err);
      alert("No se pudo conectar con el servidor.");
    }
  });
});
/*
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#loginForm');
  const btn  = document.querySelector('#btn-login') || document.querySelector('button[type="submit"]');

  console.log('Listener de login ATTACHED', { formExists: !!form });

  // Diagnóstico: ver si el click llega
  btn?.addEventListener('click', () => console.log('CLICK submit'));

  form.addEventListener('submit', async (e) => {
    console.log('SUBMIT FIRED');   // <- si no ves esto, era validación nativa antes
    e.preventDefault();

    const correo   = document.querySelector('#correo')?.value?.trim() ?? '';
    const password = document.querySelector('#password')?.value ?? '';

    if (!correo || !password) {
      alert('Ingrese correo y contraseña');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) {
      alert('Correo inválido');
      return;
    }

    try {
      const r = await fetch('http://localhost:8081/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password })
      });

      if (!r.ok) {
        const txt = await r.text().catch(() => '');
        alert('Credenciales inválidas' + (txt ? `: ${txt}` : ''));
        return;
      }

      const data = await r.json();
      localStorage.setItem('user', JSON.stringify(data));
      window.location.href = './Cuentas.html';
    } catch (err) {
      console.error(err);
      alert('No se pudo conectar con el servidor.');
    }
  });

  // Diagnóstico: ver qué campo es inválido si activas validación nativa
  form.addEventListener('invalid', (e) => {
    console.warn('Campo inválido:', e.target.name || e.target.id, e.target.validationMessage);
  }, true);
});*/