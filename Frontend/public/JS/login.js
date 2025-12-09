// Frontend/public/JS/login.js

document.addEventListener("DOMContentLoaded", function() {
    var baseUrl = "http://localhost:8081";
    var form = document.getElementById("loginForm");

    var N = function(v) {
        var n = Number(v);
        return Number.isFinite(n) ? n : null;
    };

    if (form) {
        form.addEventListener("submit", async function(e) {
            e.preventDefault();

            var elCorreo = document.getElementById("correo") || document.getElementById("email") || document.getElementById("usuario");
            var elPass = document.getElementById("password") || document.getElementById("contrasena");

            var userValue = elCorreo ? elCorreo.value.trim() : "";
            var passValue = elPass ? elPass.value.trim() : "";

            if (!userValue || !passValue) {
                alert("Completa usuario y contraseña.");
                return;
            }

            var payload = { password: passValue };
            if (userValue.indexOf("@") > -1) {
                payload.email = userValue;
                payload.correo = userValue;
            } else {
                payload.username = userValue;
                payload.usuario = userValue;
            }

            try {
                var resp = await fetch(baseUrl + "/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                if (!resp.ok) {
                    var tx = await resp.text().catch(function() { return ""; });
                    console.warn("Login fallido:", resp.status, tx);
                    alert("Usuario o contraseña incorrectos.");
                    return;
                }

                var data = await resp.json();

                // --- Normalización segura (Sin '??' ni '?.') ---
                var token = data.token || data.accessToken || data.jwt || null;

                var rawId = data.idUsuario || data.idCliente || data.usuarioId;
                if (!rawId && data.usuario) rawId = data.usuario.idUsuario;
                var idUsuario = N(rawId);

                var rawPersona = data.personaId;
                if (!rawPersona && data.persona) rawPersona = data.persona.idPersona;
                var personaId = N(rawPersona);

                var rawRol = data.idRol || data.rol;
                if (!rawRol && data.usuario && data.usuario.rol) rawRol = data.usuario.rol.idRol;
                if (!rawRol && data.usuario) rawRol = data.usuario.idRol;
                var idRol = N(rawRol);

                // Guardar sesión
                var userObj = {
                    idUsuario: idUsuario,
                    personaId: personaId,
                    idRol: idRol,
                    token: token
                };

                localStorage.setItem("user", JSON.stringify(userObj));
                localStorage.removeItem("userId");

                // Redirige al Inicio
                window.location.href = "Inicio_Dunamys.html";

            } catch (err) {
                console.error("Error en login:", err);
                alert("No se pudo conectar con el servidor.");
            }
        });
    }
});