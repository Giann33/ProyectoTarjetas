// --- contacto.js ---
// Valida y envía los datos del formulario de contacto.

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const asunto = document.getElementById("asunto").value.trim();
    const mensaje = document.getElementById("mensaje").value.trim();

    // Validaciones
    if (!nombre || !telefono || !asunto || !mensaje) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    if (!/^[0-9]{8}$/.test(telefono)) {
      alert("El número de teléfono debe tener 8 dígitos.");
      return;
    }

    const data = { nombre, telefono, asunto, mensaje };
    console.log("Mensaje enviado:", data);

    // Simulación de envío
    alert("Gracias por contactarnos. Su mensaje ha sido enviado.");
    form.reset();
  });
});
