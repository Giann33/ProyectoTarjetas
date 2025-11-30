document.addEventListener("DOMContentLoaded", () => {
    cargarTarjetas();
});

function obtenerUsuarioEnSesion() {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try { return JSON.parse(raw); } 
    catch (e) { return null; }
}

async function obtenerCuentasUsuario() {
    const usuario = obtenerUsuarioEnSesion();
    if (!usuario) return [];

    const resp = await fetch(`http://localhost:8081/api/cuentas/usuario/${usuario.idUsuario}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${usuario.token}`
        }
    });

    if (!resp.ok) return [];

    return await resp.json(); 
}

async function cargarTarjetas() {

    // Verificar usuario en sesión
    const usuario = obtenerUsuarioEnSesion();
    if (!usuario) {
        alert("No hay sesión activa. Vuelve a iniciar sesión.");
        window.location.href = "Login.html"; // ajusta si tu login se llama distinto
        return;
    }

    // 1. Obtener cuentas del usuario para traducir idCuenta → numeroCuenta
    const cuentas = await obtenerCuentasUsuario();
    const mapaCuentas = {};
    cuentas.forEach(c => {
        mapaCuentas[c.idCuenta] = c.numeroCuenta;
    });

    // 2. Obtener TODAS las tarjetas del sistema
    fetch("http://localhost:8081/api/tarjetas")
        .then(response => response.json())
        .then(tarjetas => {

            // 3. Filtrar solo las tarjetas cuyas cuentas pertenecen al usuario
            const tarjetasUsuario = tarjetas.filter(t => mapaCuentas.hasOwnProperty(t.idCuenta));

            const tbody = document.querySelector("#tablaTarjetas tbody");
            tbody.innerHTML = "";

            if (tarjetasUsuario.length === 0) {
                tbody.innerHTML = "<tr><td colspan='8' style='text-align:center'>No tienes tarjetas registradas.</td></tr>";
                return;
            }

            // 4. Dibujar solo las tarjetas del usuario
            tarjetasUsuario.forEach(t => {

                const fila = document.createElement("tr");

                let emisorTexto = t.idEmisor === 1 ? "Visa" : (t.idEmisor === 2 ? "Mastercard" : "Otro");
                let tipoTexto = t.idTipoTarjeta === 1 ? "Débito" : (t.idTipoTarjeta === 2 ? "Crédito" : "Otro");
                const estado = t.activo === 1 ? "Activo" : "Inactivo";

                const numeroCuenta = mapaCuentas[t.idCuenta] || "(Cuenta no encontrada)";

                fila.innerHTML = `
                    <td>${t.idTarjeta}</td>
                    <td>${t.numeroTarjeta}</td>
                    <td>${t.fechaExpiracion}</td>
                    <td>${emisorTexto}</td>
                    <td>${tipoTexto}</td>
                    <td>${numeroCuenta}</td>
                    <td><span style="padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; background-color: #d4edda; color: #155724;">${estado}</span></td>

                    <td style="text-align:center">
                        <button onclick="window.location.href='Editar_Tarjeta.html?id=${t.idTarjeta}'" 
                                style="background:#007bff; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">
                            <i class="fa-solid fa-pen"></i> Editar
                        </button>
                    </td>
                `;

                tbody.appendChild(fila);
            });
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Error al cargar las tarjetas. Asegúrate de que el Backend esté corriendo.");
        });
}