document.addEventListener("DOMContentLoaded", async () => {
  const baseUrl = "http://localhost:8081";

  // Limpia claves antiguas que guardaban "5:1"
  localStorage.removeItem("userId");
  

  // Esperamos que, tras el login, guardes algo así:
  // localStorage.setItem("user", JSON.stringify({ idUsuario: 5, personaId: 1, token: "..." }));

//localStorage.setItem("userId", "1"); // ELIMINAR ESTA LINEA AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
//localStorage.setItem("user", JSON.stringify({ idUsuario: 1, personaId: 1 })); // ELIMINAR ESTA LINEA AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA

  const raw = localStorage.getItem("user");
  if (!raw) {
    console.warn("No hay sesión. Redirigiendo a login...");
    // location.href = "index.html";
    return;
  }

  const session = JSON.parse(raw);
  let { idUsuario, personaId, token } = session;

  // Si por herencia viene "5:1", lo saneamos
  const safeNum = (v) => {
    if (v == null) return null;
    const first = String(v).split(":")[0];
    const n = Number(first);
    return Number.isFinite(n) ? n : null;
  };

  idUsuario = safeNum(idUsuario);
  personaId = safeNum(personaId);

  console.log("idUsuario =", idUsuario, "personaId =", personaId);

  if (!idUsuario) {
    console.error("idUsuario inválido. Revisa lo que guardas en localStorage['user'].");
    return;
  }

  const headers = {
    "Accept": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };

  // ====== USUARIO ======
  try {
    const userUrl = `${baseUrl}/api/usuarios/${idUsuario}`;
    console.log("GET", userUrl);
    const userResp = await fetch(userUrl, { headers });

    if (!userResp.ok) {
      console.warn("No se pudo obtener usuario:", userResp.status);
    } else {
      const usuario = await userResp.json();
      document.getElementById("nombre").value = usuario.nombre ?? "";
      document.getElementById("correo").value = usuario.correo ?? "";
      document.getElementById("contrasena").placeholder = "Ingrese nueva contraseña";
      if (document.getElementById("genero") && usuario.idGenero != null) {
        document.getElementById("genero").value = String(usuario.idGenero);
      }
      // Si el backend te devuelve personaId, úsalo para arreglar sesiones viejas:
      if (!personaId && usuario.personaId != null) {
        personaId = usuario.personaId;
        localStorage.setItem("user", JSON.stringify({ ...session, personaId }));
      }
    }
  } catch (e) {
    console.error("Error consultando usuario:", e);
  }});

  // ====== CUENTAS POR PERSONA ======
 /*
 
  try {
    if (!personaId) {
      console.warn("personaId no disponible; no se puede consultar cuentas.");
      return;
    }
    const cuentasUrl = `${baseUrl}/api/cuentas/persona/${personaId}`;
    console.log("GET", cuentasUrl);
    const cuentasResp = await fetch(cuentasUrl, { headers });

    if (cuentasResp.ok) {
      const cuentas = await cuentasResp.json();
      const numeroInput = document.getElementById("numeroCuenta");
      if (numeroInput) numeroInput.value = cuentas[0]?.numeroCuenta ?? "";
    } else if (cuentasResp.status === 204) {
      console.log("La persona no tiene cuentas.");
    } else {
      console.warn("No se pudieron obtener cuentas:", cuentasResp.status);
    }
  } catch (e) {
    console.error("Error consultando cuentas:", e);
  }
});

*/




/*
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Simulación: datos traídos de la base de datos
    // (en un proyecto real sería fetch("https://tuservidor/api/usuario"))
    const datosUsuario = {
      nombre: "Sofía Retana",
      correo: "sofia@ejemplo.com",
      contrasena: "",
      genero: "femenino"
    };

    // Asignar placeholders dinámicamente
    document.getElementById("nombre").placeholder = datosUsuario.nombre || "Ingrese su nombre";
    document.getElementById("correo").placeholder = datosUsuario.correo || "ejemplo@correo.com";
    document.getElementById("contrasena").placeholder = "Ingrese su contraseña";

    // Seleccionar el género si hay uno definido
    const generoSelect = document.getElementById("genero");
    if (datosUsuario.genero) {
      generoSelect.value = datosUsuario.genero;
    }

  } catch (error) {
    console.error("Error cargando datos:", error);
  }
});
*/


/*

// Verificar disponibilidad de storage
const checkStorage = () => {
    let storage = null;
    
    try {
        // Prueba localStorage
        if (window.localStorage) {
            localStorage.setItem('test', '1');
            localStorage.removeItem('test');
            console.log('localStorage está disponible');
            storage = 'localStorage';
        }
    } catch (e) {
        console.log('localStorage no está disponible');
    }
    
    try {
        // Prueba sessionStorage
        if (window.sessionStorage) {
            sessionStorage.setItem('test', '1');
            sessionStorage.removeItem('test');
            console.log('sessionStorage está disponible');
            storage = storage || 'sessionStorage';
        }
    } catch (e) {
        console.log('sessionStorage no está disponible');
    }
    
    return storage;
};

// Ejecutar la verificación cuando cargue el documento
document.addEventListener("DOMContentLoaded", () => {
    const availableStorage = checkStorage();
    console.log('Storage disponible:', availableStorage);
});  

*/