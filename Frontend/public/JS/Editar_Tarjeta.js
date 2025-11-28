document.addEventListener("DOMContentLoaded", () => {
    // 1. Obtener el ID de la URL (ej: Editar_Tarjeta.html?id=5)
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        alert("No se especificó ninguna tarjeta para editar.");
        window.location.href = "Consultar_Tarjetas.html";
        return;
    }

    // 2. Cargar los datos actuales de la tarjeta
    fetch(`http://localhost:8081/api/tarjetas`) // Traemos todas (idealmente harías un endpoint por ID, pero esto sirve por ahora)
        .then(res => res.json())
        .then(tarjetas => {
            const tarjeta = tarjetas.find(t => t.idTarjeta == id);
            if (tarjeta) {
                llenarFormulario(tarjeta);
            } else {
                alert("Tarjeta no encontrada");
            }
        });
});

function llenarFormulario(t) {
    document.getElementById("idTarjeta").value = t.idTarjeta;
    document.getElementById("numTarjeta").value = t.numeroTarjeta;
    document.getElementById("fechaExp").value = t.fechaExpiracion;
    document.getElementById("cvv").value = t.cvv;
    document.getElementById("pin").value = t.pin;
    document.getElementById("emisor").value = t.idEmisor;
    document.getElementById("tipoTarjeta").value = t.idTipoTarjeta;
    document.getElementById("idCuenta").value = t.idCuenta;
}

// 3. Guardar los cambios
document.getElementById("formEditar").addEventListener("submit", function(e) {
    e.preventDefault();
    const id = document.getElementById("idTarjeta").value;

    const data = {
        numeroTarjeta: document.getElementById("numTarjeta").value,
        fechaExpiracion: document.getElementById("fechaExp").value,
        cvv: document.getElementById("cvv").value,
        pin: document.getElementById("pin").value,
        idEmisor: parseInt(document.getElementById("emisor").value),
        idTipoTarjeta: parseInt(document.getElementById("tipoTarjeta").value),
        idCuenta: parseInt(document.getElementById("idCuenta").value)
    };

    fetch(`http://localhost:8081/api/tarjetas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                alert("✅ Tarjeta actualizada correctamente");
                window.location.href = "Consultar_Tarjetas.html";
            } else {
                alert("❌ Error al actualizar");
            }
        });
});