// Frontend/public/JS/login.js

document.addEventListener("DOMContentLoaded", () => {
  const baseUrl = "http://localhost:8081";            
  const form = document.getElementById("loginForm");  

  // Helpers
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
      payload.email = userValue;      // muchos backends esperan "email"
      payload.correo = userValue;     // otros esperan "correo"
    } else {
      payload.username = userValue;   // "username" / "usuario"
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

      // Normalizar campos del backend
      const token =
        data.token ?? data.accessToken ?? data.jwt ?? data.id_token ?? null;

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

      // se guarda SOLO lo que se necesita en sesión
      localStorage.setItem("user", JSON.stringify({ idUsuario, personaId, token }));

      // (opcional) limpia claves viejas que te rompían URLs
      localStorage.removeItem("userId"); // por si quedó "5:1" de antes

      // Sanity log
      console.log("Sesión guardada:", { idUsuario, personaId, token: !!token });

      // Redirige donde corresponda:
      window.location.href = "Cuentas.html"; // <--- tu página destino
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