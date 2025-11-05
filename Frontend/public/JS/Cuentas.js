// Función para formatear montos en colones
function formatoCRC(valor) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0
  }).format(valor);
}

// Datos de ejemplo (podrían venir de un backend o una API)
const cuentas = [
  {
    nombre: "Cuenta Personal",
    numero: "CR 1111 2222 4333 4444",
    monto: 75000
  },
  {
    nombre: "Cuenta de Objetivos",
    numero: "CR 9999 8888 7777 6666",
    monto: 30500
  }
];



// Asignar los valores a las etiquetas
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("acc1-name").textContent   = cuentas[0].nombre;
  document.getElementById("acc1-number").textContent = cuentas[0].numero;
  document.getElementById("acc1-amount").textContent = formatoCRC(cuentas[0].monto);

  document.getElementById("acc2-name").textContent   = cuentas[1].nombre;
  document.getElementById("acc2-number").textContent = cuentas[1].numero;
  document.getElementById("acc2-amount").textContent = formatoCRC(cuentas[1].monto);
});