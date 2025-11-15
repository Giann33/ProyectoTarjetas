// JS/Reversos.js
document.addEventListener("DOMContentLoaded", () => {
  const idTxEl = document.getElementById("idTransaccion");
  const fDesde = document.getElementById("fechaDesde");
  const fHasta = document.getElementById("fechaHasta");

  const btnBuscar = document.getElementById("btn-buscar");
  const btnLimpiar = document.getElementById("btn-limpiar");

  const cardResumen = document.getElementById("card-resumen");
  const cardPagos = document.getElementById("card-pagos");
  const cardAccion = document.getElementById("card-accion");
  const cardBitacora = document.getElementById("card-bitacora");

  const rId = document.getElementById("r-id");
  const rFecha = document.getElementById("r-fecha");
  const rTarjeta = document.getElementById("r-tarjeta");
  const rEmisor = document.getElementById("r-emisor");
  const rMoneda = document.getElementById("r-moneda");
  const rMonto = document.getElementById("r-monto");

  const tablaPagosBody = document.querySelector("#tablaPagos tbody");

  const tipoAccion = document.getElementById("tipoAccion");
  const montoAccion = document.getElementById("montoAccion");
  const motivo = document.getElementById("motivo");
  const observaciones = document.getElementById("observaciones");
  const adjunto = document.getElementById("adjunto");

  const btnSimular = document.getElementById("btn-simular");
  const btnGenerar = document.getElementById("btn-generar");
  const btnRegistrar = document.getElementById("btn-registrar");

  const simulacion = document.getElementById("simulacion");
  const sTotal = document.getElementById("s-total");
  const sMonto = document.getElementById("s-monto");
  const sRestante = document.getElementById("s-restante");

  const tablaBitacora = document.querySelector("#tablaBitacora tbody");

  let pagos = [];         // pagos asociados a la transacción
  let resumen = null;     // datos de cabecera
  let bitacora = [];      // memoria local de reversos/devoluciones

  const fmt = (n) => Number(n).toFixed(2);

  // ----- SIMULACIÓN de fetch (reemplaza por fetch real a tu backend) -----
  async function fetchTransaccionYPagos(idTransaccion, desde, hasta) {
    // Aquí llamarías a tu API: /transacciones/{id}/pagos?desde=...&hasta=...
    // Para demo, devolvemos datos falsos en la misma moneda
    const hoy = new Date().toISOString().slice(0,10);
    return {
      resumen: {
        idTransaccion,
        fecha: hoy,
        numeroTarjeta: "**** **** **** 1234",
        emisor: "Emisor X",
        moneda: "CRC",
        montoTotal: 25750.75
      },
      pagos: [
        { idPago: 501, fecha: hoy, monto: 12500.50, moneda: "CRC" },
        { idPago: 502, fecha: hoy, monto: 13250.25, moneda: "CRC" }
      ]
    };
  }

  function pintarResumen(r) {
    rId.textContent = r.idTransaccion;
    rFecha.textContent = r.fecha;
    rTarjeta.textContent = r.numeroTarjeta;
    rEmisor.textContent = r.emisor;
    rMoneda.textContent = r.moneda;
    rMonto.textContent = fmt(r.montoTotal);
    cardResumen.hidden = false;
  }

  function pintarPagos(list) {
    tablaPagosBody.innerHTML = "";
    list.forEach((p, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${p.idPago}</td>
        <td>${p.fecha}</td>
        <td>${fmt(p.monto)}</td>
        <td>${p.moneda}</td>
        <td><input type="checkbox" class="chk-pago" data-id="${p.idPago}" data-m="${p.monto}"></td>
      `;
      tablaPagosBody.appendChild(tr);
    });
    cardPagos.hidden = false;
    cardAccion.hidden = false;
  }

  function totalSeleccionado() {
    return Array.from(document.querySelectorAll(".chk-pago:checked"))
      .map(chk => Number(chk.dataset.m))
      .reduce((a,b) => a + b, 0);
  }

  // --- Buscar
  btnBuscar.addEventListener("click", async () => {
    const id = Number(idTxEl.value);
    if (!id) { alert("Ingresa un idTransaccion válido."); return; }

    try {
      const data = await fetchTransaccionYPagos(id, fDesde.value, fHasta.value);
      resumen = data.resumen;
      pagos = data.pagos;
      pintarResumen(resumen);
      pintarPagos(pagos);
      cardBitacora.hidden = bitacora.length === 0;
      pintarBitacora();
    } catch (e) {
      console.error(e);
      alert("No se pudo obtener la información de la transacción.");
    }
  });

  // --- Limpiar
  btnLimpiar.addEventListener("click", () => {
    idTxEl.value = "";
    fDesde.value = "";
    fHasta.value = "";
    tablaPagosBody.innerHTML = "";
    cardResumen.hidden = true;
    cardPagos.hidden = true;
    cardAccion.hidden = true;
    simulacion.hidden = true;
  });

  // --- Simular
  btnSimular.addEventListener("click", () => {
    const sel = totalSeleccionado();
    const m = Number(montoAccion.value || 0);
    if (sel <= 0) { alert("Selecciona al menos un pago."); return; }
    if (m <= 0) { alert("Ingresa un monto a reversar/devolver mayor que 0."); return; }
    if (m > sel + 0.0001) { alert("El monto no puede exceder el total seleccionado."); return; }

    sTotal.textContent = fmt(sel);
    sMonto.textContent = fmt(m);
    sRestante.textContent = fmt(sel - m);
    simulacion.hidden = false;
  });

  // --- Generar archivo (CSV)
  btnGenerar.addEventListener("click", () => {
    if (!resumen) { alert("Primero busca una transacción."); return; }
    const m = Number(montoAccion.value || 0);
    if (m <= 0) { alert("Ingresa un monto válido."); return; }

    const headers = ["Fecha","Transaccion","Tipo","Monto","Moneda","Motivo","Observaciones"];
    const line = [
      new Date().toISOString().slice(0,10),
      resumen.idTransaccion,
      tipoAccion.value,
      fmt(m),
      resumen.moneda,
      (motivo.value || ""),
      (observaciones.value || "").replace(/[\r\n,]+/g, " ")
    ];
    const csv = [headers.join(","), line.join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `reverso-${resumen.idTransaccion}.csv`;
    document.body.appendChild(a); a.click();
    URL.revokeObjectURL(url); a.remove();
  });

  // --- Registrar (placeholder de POST)
  btnRegistrar.addEventListener("click", async () => {
    if (!resumen) { alert("Primero busca una transacción."); return; }
    const m = Number(montoAccion.value || 0);
    if (m <= 0) { alert("Ingresa un monto válido."); return; }

    // Aquí harías un fetch POST a tu backend con el payload
    // fetch('/reversos', { method:'POST', body: JSON.stringify({...}) })

    // Simulamos registro y actualizamos bitácora local
    bitacora.unshift({
      fecha: new Date().toISOString().slice(0,19).replace("T"," "),
      transaccion: resumen.idTransaccion,
      tipo: tipoAccion.value,
      monto: fmt(m),
      motivo: motivo.value || "",
      estado: "Registrado"
    });
    pintarBitacora();
    cardBitacora.hidden = false;
    alert("Reverso/Devolución registrado (simulado). Integra tu endpoint en JS/Reversos.js.");
  });

  function pintarBitacora() {
    tablaBitacora.innerHTML = "";
    bitacora.slice(0,10).forEach(b => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${b.fecha}</td>
        <td>${b.transaccion}</td>
        <td>${b.tipo}</td>
        <td>${b.monto}</td>
        <td>${b.motivo}</td>
        <td>${b.estado}</td>
      `;
      tablaBitacora.appendChild(tr);
    });
  }
});