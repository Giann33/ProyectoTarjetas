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

document.addEventListener("DOMContentLoaded", async () => {
  try {

    
    localStorage.setItem("userId", "1"); // ELIMINAR ESTA LINEA AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA


    // Obtener userId desde localStorage
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.warn("No hay userId almacenado en localStorage");
      return;
    }

    const baseUrl = "http://localhost:8080";

    // Fetch datos de usuario
    const userResp = await fetch(`${baseUrl}/api/usuarios/${encodeURIComponent(userId)}`, {
      headers: { "Accept": "application/json" }
    });
    
    if (!userResp.ok) {
      console.warn("No se pudo obtener usuario:", userResp.status);
    } else {
      const usuario = await userResp.json();
      document.getElementById("nombre").value = usuario.nombre || "";
      document.getElementById("correo").value = usuario.correo || "";
      document.getElementById("contrasena").placeholder = "Ingrese nueva contraseña";
      
      if (usuario.genero) {
        const generoSelect = document.getElementById("genero");
        if (generoSelect) generoSelect.value = usuario.genero;
      }
    }

    // Fetch cuentas asociadas
    const cuentasResp = await fetch(`${baseUrl}/api/cuentas/persona/${encodeURIComponent(userId)}`, {
      headers: { "Accept": "application/json" }
    });
    
    if (cuentasResp.ok) {
      const cuentas = await cuentasResp.json();
      console.log("Cuentas:", cuentas);
      const first = cuentas.length ? cuentas[0].numeroCuenta : "";
      const numeroInput = document.getElementById("numeroCuenta");
      if (numeroInput) numeroInput.value = first;
    } else if (cuentasResp.status !== 204) {
      console.warn("No se pudieron obtener cuentas:", cuentasResp.status);
    }

  } catch (error) {
    console.error("Error cargando datos:", error);
  }
});

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