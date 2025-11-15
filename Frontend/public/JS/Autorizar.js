// JS/Autorizar.js
document.addEventListener("DOMContentLoaded", () => {
  // Filtros
  const fEstado = document.getElementById("fEstado");
  const fEmisor = document.getElementById("fEmisor");
  const fDesde  = document.getElementById("fDesde");
  const fHasta  = document.getElementById("fHasta");

  const btnBuscar  = document.getElementById("btn-buscar");
  const btnLimpiar = document.getElementById("btn-limpiar");

  // KPIs
  const kpiPend = document.getElementById("kpi-pend");
  const kpiAuto = document.getElementById("kpi-auto");
  const kpiRech = document.getElementById("kpi-rech");

  // Tabla
  const tbody = document.querySelector("#tablaAuthz tbody");
  const chkTodos = document.getElementById("chk-todos");

  // Acciones masivas
  const btnAutoMasivo = document.getElementById("btn-autorizarmasivo");
  const btnRechMasivo = document.getElementById("btn-rechazarmasivo");
  const btnExportar   = document.getElementById("btn-exportar");

  // Dialog rechazo
  const dlgRechazo = document.getElementById("dlg-rechazo");
  const txtMotivo  = document.getElementById("txt-motivo");
  const btnConfirmRechazo = document.getElementById("btn-confirmar-rechazo");

  // Estado
  let transacciones = [];   // todas las que trajo el backend (simulado)
  let seleccionadas = new Set(); // ids seleccionados para acción masiva
  let colaRechazo = [];     // ids a rechazar cuando confirme el motivo

  // --- Simulación de backend ---
  // En producción: GET /transacciones?estado=...&emisor=...&desde=...&hasta=...
  async function fetchTransacciones(params) {
    // Genera 12 filas de demo con distintos estados y emisores
    const hoy = new Date();
    const pad2 = (n) => String(n).padStart(2, "0");
    const mkDate = (d) => {
      const x = new Date(hoy.getTime() - d*86400000);
      return `${x.getFullYear()}-${pad2(x.getMonth()+1)}-${pad2(x.getDate())}`;
    };

    const demo = Array.from({ length: 12 }, (_, i) => {
      const estados = ["pendiente", "autorizada", "rechazada"];
      const emisores = ["Emisor X", "Emisor Y"];
      const estado = i < 6 ? "pendiente" : (i % 2 === 0 ? "autorizada" : "rechazada");
      const emisor = emisores[i % 2];
      const monto = 5000 + i * 123.45;
      return {
        idTransaccion: 10000 + i,
        fecha: mkDate(i),
        tarjeta: "**** **** **** " + String(1111 + i),
        emisor,
        monto: monto,
        moneda: "CRC",
        estado
      };
    });

    // filtros básicos en front (si tu API ya filtra, quita esto)
    let data = demo;
    if (params.estado) data = data.filter(r => r.estado === params.estado);
    if (params.emisor) data = data.filter(r => r.emisor === params.emisor);
    const dMin = params.desde ? new Date(params.desde) : null;
    const dMax = params.hasta ? new Date(params.hasta) : null;
    if (dMin) data = data.filter(r => new Date(r.fecha) >= dMin);
    if (dMax) data = data.filter(r => new Date(r.fecha) <= dMax);

    return data;
  }

  function renderTabla(list) {
    tbody.innerHTML = "";
    seleccionadas.clear();
    chkTodos.checked = false;

    list.forEach((r) => {
      const tr = document.createElement("tr");

      const tdSel = document.createElement("td");
      tdSel.innerHTML = `<input type="checkbox" class="chk-row" data-id="${r.idTransaccion}">`;
      tr.appendChild(tdSel);

      const tdId = document.createElement("td");
      tdId.textContent = r.idTransaccion;
      tr.appendChild(tdId);

      const tdF = document.createElement("td");
      tdF.textContent = r.fecha;
      tr.appendChild(tdF);

      const tdT = document.createElement("td");
      tdT.textContent = r.tarjeta;
      tr.appendChild(tdT);

      const tdE = document.createElement("td");
      tdE.textContent = r.emisor;
      tr.appendChild(tdE);

      const tdM = document.createElement("td");
      tdM.textContent = r.monto.toFixed(2);
      tr.appendChild(tdM);

      const tdMo = document.createElement("td");
      tdMo.textContent = r.moneda;
      tr.appendChild(tdMo);

      const tdEst = document.createElement("td");
      tdEst.textContent = r.estado.charAt(0).toUpperCase() + r.estado.slice(1);
      tr.appendChild(tdEst);

      const tdAcc = document.createElement("td");
      tdAcc.innerHTML = `
        <button class="btn-primary btn-mini" data-acc="autorizar" data-id="${r.idTransaccion}"><i class="fa-solid fa-check"></i></button>
        <button class="btn-danger btn-mini"  data-acc="rechazar"  data-id="${r.idTransaccion}"><i class="fa-solid fa-ban"></i></button>
      `;
      tr.appendChild(tdAcc);

      // Colorear por estado
      if (r.estado === "pendiente") tr.style.background = "rgba(255, 193, 7, 0.12)";
      if (r.estado === "autorizada") tr.style.background = "rgba(25, 135, 84, 0.12)";
      if (r.estado === "rechazada") tr.style.background = "rgba(220, 53, 69, 0.12)";

      tbody.appendChild(tr);
    });
  }

  function updateKPIs(list) {
    const p = list.filter(x => x.estado === "pendiente").length;
    const a = list.filter(x => x.estado === "autorizada").length;
    const r = list.filter(x => x.estado === "rechazada").length;
    kpiPend.textContent = p;
    kpiAuto.textContent = a;
    kpiRech.textContent = r;
  }

  // ---- Eventos de UI ----
  btnBuscar.addEventListener("click", async () => {
    const params = {
      estado: fEstado.value || "",
      emisor: fEmisor.value || "",
      desde:  fDesde.value || "",
      hasta:  fHasta.value || ""
    };
    transacciones = await fetchTransacciones(params);
    renderTabla(transacciones);
    updateKPIs(transacciones);
  });

  btnLimpiar.addEventListener("click", () => {
    fEstado.value = "pendiente";
    fEmisor.value = "";
    fDesde.value = "";
    fHasta.value = "";
    transacciones = [];
    renderTabla(transacciones);
    updateKPIs(transacciones);
  });

  // Seleccionar todos
  chkTodos.addEventListener("change", () => {
    document.querySelectorAll(".chk-row").forEach(chk => {
      chk.checked = chkTodos.checked;
      const id = Number(chk.dataset.id);
      if (chk.checked) seleccionadas.add(id);
      else seleccionadas.delete(id);
    });
  });

  // Delegación de selección por fila + acciones por fila
  tbody.addEventListener("change", (e) => {
    if (e.target.classList.contains("chk-row")) {
      const id = Number(e.target.dataset.id);
      if (e.target.checked) seleccionadas.add(id);
      else seleccionadas.delete(id);
    }
  });

  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-acc]");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const acc = btn.dataset.acc;

    if (acc === "autorizar") {
      autorizar([id]);
    } else if (acc === "rechazar") {
      colaRechazo = [id];
      abrirDialogoRechazo();
    }
  });

  // Acciones masivas
  btnAutoMasivo.addEventListener("click", () => {
    if (!seleccionadas.size) return alert("Selecciona al menos una transacción.");
    autorizar([...seleccionadas]);
  });

  btnRechMasivo.addEventListener("click", () => {
    if (!seleccionadas.size) return alert("Selecciona al menos una transacción.");
    colaRechazo = [...seleccionadas];
    abrirDialogoRechazo();
  });

  btnExportar.addEventListener("click", () => {
    if (!seleccionadas.size) return alert("Selecciona al menos una transacción.");
    exportarSeleccionadas([...seleccionadas]);
  });

  // Dialog rechazo
  function abrirDialogoRechazo() {
    txtMotivo.value = "";
    if (typeof dlgRechazo.showModal === "function") dlgRechazo.showModal();
    else alert("Escribe el motivo de rechazo en el siguiente prompt.");
  }

  btnConfirmRechazo.addEventListener("click", (e) => {
    e.preventDefault();
    const motivo = txtMotivo.value.trim();
    if (!motivo) { alert("Debes escribir un motivo."); return; }
    rechazar(colaRechazo, motivo);
    dlgRechazo.close();
  });

  // ---- Lógica de negocio (simulada) ----
  // En producción, harías:
  //  - POST /transacciones/autorizar { ids: [...] }
  //  - POST /transacciones/rechazar  { ids: [...], motivo: "..." }

  function autorizar(ids) {
    transacciones = transacciones.map(tx =>
      ids.includes(tx.idTransaccion) ? { ...tx, estado: "autorizada" } : tx
    );
    renderTabla(transacciones);
    updateKPIs(transacciones);
    seleccionadas.clear();
    alert(`Autorizadas: ${ids.length} transacciones.`);
  }

  function rechazar(ids, motivo) {
    transacciones = transacciones.map(tx =>
      ids.includes(tx.idTransaccion) ? { ...tx, estado: "rechazada", motivoRechazo: motivo } : tx
    );
    renderTabla(transacciones);
    updateKPIs(transacciones);
    seleccionadas.clear();
    alert(`Rechazadas: ${ids.length} transacciones.\nMotivo: ${motivo}`);
  }

  function exportarSeleccionadas(ids) {
    const rows = transacciones.filter(tx => ids.includes(tx.idTransaccion));
    if (!rows.length) return;

    const headers = ["idTransaccion","Fecha","Tarjeta","Emisor","Monto","Moneda","Estado"];
    const lines = [headers.join(",")];
    rows.forEach(r => {
      lines.push([
        r.idTransaccion,
        r.fecha,
        r.tarjeta,
        r.emisor,
        r.monto.toFixed(2),
        r.moneda,
        r.estado
      ].join(","));
    });

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");
    a.download = `autorizar-seleccion-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  }

  // Carga inicial: pendientes
  (async function init() {
    fEstado.value = "pendiente";
    transacciones = await fetchTransacciones({ estado: "pendiente" });
    renderTabla(transacciones);
    updateKPIs(transacciones);
  })();
});