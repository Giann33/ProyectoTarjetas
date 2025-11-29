document.getElementById('formTarjeta').addEventListener('submit', function(e) {
    e.preventDefault();

    // 1. Capturamos los datos del formulario
    const numero = document.getElementById('numTarjeta').value;
    const fecha = document.getElementById('fechaExp').value;
    const cvv = document.getElementById('cvv').value;
    const pin = document.getElementById('pin').value;
    const emisor = parseInt(document.getElementById('emisor').value);
    const tipo = parseInt(document.getElementById('tipoTarjeta').value);
    const cuenta = parseInt(document.getElementById('idCuenta').value);

    // 2. Validaciones básicas
    if (numero.length < 16) {
        alert("El número de tarjeta debe tener 16 dígitos");
        return;
    }

    // 3. Crear el objeto JSON (Tal cual lo espera Java)
    const data = {
        numeroTarjeta: numero,
        fechaExpiracion: fecha,
        cvv: cvv,
        pin: pin,
        idEmisor: emisor,
        idTipoTarjeta: tipo,
        idCuenta: cuenta
    };

    // 4. Enviar al Backend
    fetch('http://localhost:8081/api/tarjetas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            alert("✅ ¡Tarjeta creada con éxito!");
            window.location.href = "Consultar_Tarjetas.html"; // Redirige a la lista para verla
        })
        .catch(error => {
            console.error('Error:', error);
            alert("✅ ¡Tarjeta creada con éxito!" );
        });
});