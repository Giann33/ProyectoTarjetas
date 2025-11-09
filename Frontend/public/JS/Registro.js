// --- registro.js ---
// Este script valida el formulario de registro y simula el envío de datos al servidor.

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const iban = document.getElementById("iban").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const apellidos = document.getElementById("apellidos").value.trim();
    const correo = document.getElementById("correo").value.trim();

    // Validaciones básicas
    if (!iban || !nombre || !apellidos || !correo) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    if (!/^[A-Z]{2}\d{2}/.test(iban)) {
      alert("El IBAN debe comenzar con dos letras seguidas de números. Ejemplo: CR05...");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(correo)) {
      alert("Por favor, ingrese un correo electrónico válido.");
      return;
    }

    // Datos simulados que se enviarían al backend
    const data = { iban, nombre, apellidos, correo };
    console.log("Datos enviados al servidor:", data);

    // Simulación de envío exitoso
    alert("¡Registro exitoso!");
    form.reset();
  });
});
