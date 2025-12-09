document.addEventListener("DOMContentLoaded", function() {
    var baseUrl = "http://localhost:8081";
    var form = document.getElementById("registroForm");

    // Usamos un IF simple para evitar errores de sintaxis
    if (form) {
        form.addEventListener("submit", async function(e) {
            e.preventDefault();

            var elNombre = document.getElementById("nombre");
            var elApellidos = document.getElementById("apellidos");
            var elCorreo = document.getElementById("correo");
            var elPass = document.getElementById("password");
            var elGenero = document.getElementById("genero");

            // Obtener valores de forma segura
            var nombre = elNombre ? elNombre.value.trim() : "";
            var apellidos = elApellidos ? elApellidos.value.trim() : "";
            var correo = elCorreo ? elCorreo.value.trim() : "";
            var password = elPass ? elPass.value.trim() : "";
            var genero = elGenero ? elGenero.value : "";

            if (!nombre || !correo || !password || !apellidos) {
                alert("Por favor completa todos los campos.");
                return;
            }

            var nuevoUsuario = {
                nombre: nombre,
                apellidos: apellidos,
                correo: correo,
                contrasena: password,
                genero: parseInt(genero),
                idRol: 2,
                activo: 1
            };

            try {
                var response = await fetch(baseUrl + "/auth/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(nuevoUsuario)
                });

                if (response.ok) {
                    alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
                    window.location.href = "index.html";
                } else {
                    var errorText = await response.text();
                    console.warn("Error registro:", errorText);
                    alert("Error al registrar: " + errorText);
                }

            } catch (error) {
                console.error("Error de conexión:", error);
                alert("No se pudo conectar con el servidor.");
            }
        });
    }
});