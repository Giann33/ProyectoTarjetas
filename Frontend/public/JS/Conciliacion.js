document.addEventListener("DOMContentLoaded", () => {
    // ---- Elementos UI
    const tipoEntidadEl = document.getElementById("tipoEntidad");
    const entidadEl = document.getElementById("entidad");
    const desdeEl = document.getElementById("desde");
    const hastaEl = document.getElementById("hasta");

    const arcIntEl = document.getElementById("archivoInterno");
    const arcExtEl = document.getElementById("archivoExterno");

    const btnEjecutar = document.getElementById("btn-ejecutar");
    const btnExportar = document.getElementById("btn-exportar");
    const btnMarcar = document.getElementById("btn-marcar");

    const kpiInterno = document.getElementById("kpi-interno");
    const kpiExterno = document.getElementById("kpi-externo");
    const kpiDiff = document.getElementById("kpi-diff");

    const tabla = document.getElementById("tablaConciliacion").querySelector("tbody");

    // ---- Estado en memoria
    let rowsInterno = [];
    let rowsExterno = [];
    let resultado = []; // filas de conciliación mostradas

    // ---- Helpers
    const parseDate = (s) => {
        // Intenta YYYY-MM-DD o DD/MM/YYYY
        if (!s) return null;
        const t = s.trim();
        if (/^\d{4}-\d{2}-\d{2}/.test(t)) return new Date(t);
        if (/^\d{2}\/\d{2}\/\d{4}/.test(t)) {
            const [d, m, y] = t.split("/");
            return new Date(+y, +m - 1, +d);
        }
        const d = new Date(t);
        return isNaN(d.getTime()) ? null : d;
    };

    const parseNumber = (s) => {
        if (s == null) return 0;
        // soporta "1,234.56" o "1.234,56" y limpia signos
        const t = String(s).replace(/[^\d,.\-]/g, "");
        // Si hay coma y punto, intenta detectar formato latino
        if (t.includes(",") && t.includes(".")) {
            // Si última coma está después del último punto, se asume coma decimal (latino)
            return Number(t.replace(/\./g, "").replace(",", "."));
        }
        // Si solo hay coma => asúmelo como decimal
        if (t.includes(",") && !t.includes(".")) return Number(t.replace(",", "."));
        return Number(t);
    };

    const getTxnId = (row) =>
        row.idTransaccion ||
        row["idTransaccion"] ||
        row["IDTRANSACCION"] ||
        row.ARN ||                   // si externo lo llama ARN
        row["Tarjeta/ARN"] ||        // o si viene mezclado
        row["RRN"] ||                // a veces lo llaman RRN
        "";

    // Autorización (si existe)
    const getAuth = (row) =>
        row.Autorizacion || row["Autorización"] || row["authorization"] || row["AUTH"] || "";

    // Fecha
    const getFecha = (row) => row.Fecha || row["fecha"] || row["FECHA"] || "";

    // Monto (soporta , y .)
    const getMonto = (row) => parseNumber(row.Monto ?? row["monto"] ?? row["Monto Interno"] ?? row["Monto Externo"]);

    const keyFor = (row) => {
        const txn = String(getTxnId(row)).trim();
        if (txn) return txn; // <<-- idTransaccion como clave principal (equivalente a ARN)

        // Fallback si algún archivo no trae idTransaccion:
        const num = (row.NumeroTarjeta || row["Numero_Tarjeta"] || row["Tarjeta"] || "").slice(-6);
        const f = parseDate(getFecha(row)) ? parseDate(getFecha(row)).toISOString().slice(0, 10) : "";
        const m = Math.round((getMonto(row) || 0) * 100) / 100;

        const auth = String(getAuth(row)).trim();
        // si trae autorización, agrégala para mayor precisión
        return auth ? `${num}|${f}|${m}|${auth}` : `${num}|${f}|${m}`;
    };

    const buildOutRow = (iR, eR) => {
        const txn = iR ? getTxnId(iR) : getTxnId(eR);
        const auth = iR ? getAuth(iR) : getAuth(eR);
        const fecha = iR ? getFecha(iR) : getFecha(eR);

        const montoI = iR ? getMonto(iR) : null;
        const montoE = eR ? getMonto(eR) : null;

        let estado = "OK";
        let diff = 0;

        if (iR && !eR) {
            estado = "Faltante Externo";
            diff = (montoI || 0) - 0;
        } else if (!iR && eR) {
            estado = "Faltante Interno";
            diff = 0 - (montoE || 0);
        } else {
            diff = (montoI || 0) - (montoE || 0);
            if (Math.abs(diff) > 0.009) estado = "Monto distinto";
        }

        return {
            Fecha: fecha,
            TxnId: txn,                  // <- antes era ARN
            Autorizacion: auth || "",    // puede venir vacío
            MontoInterno: Number.isFinite(montoI) ? montoI : null,
            MontoExterno: Number.isFinite(montoE) ? montoE : null,
            Diferencia: Number(diff),
            Estado: estado,
        };
    };

    const csvToObjects = (text) => {
        // Parser simple (CSV con comas, sin comillas complejas). Para producción, usar librería.
        // Acepta separador coma o punto y coma si detecta más ; que , en la cabecera.
        const firstLine = text.split(/\r?\n/)[0] || "";
        const useSemicolon = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length;
        const sep = useSemicolon ? ";" : ",";
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) return [];

        const headers = lines[0].split(sep).map((h) => h.trim());
        return lines.slice(1).map((line) => {
            const cols = line.split(sep);
            const obj = {};
            headers.forEach((h, i) => (obj[h] = (cols[i] ?? "").trim()));
            return obj;
        });
    };

    const readCSVFile = (file) =>
        new Promise((resolve, reject) => {
            if (!file) return resolve([]);
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    resolve(csvToObjects(String(reader.result)));
                } catch (e) {
                    reject(e);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file, "utf-8");
        });

    const inDateRange = (row, dFrom, dTo) => {
        const d = parseDate(getFecha(row));
        if (!d) return false;
        if (dFrom && d < dFrom) return false;
        if (dTo && d > dTo) return false;
        return true;
    };

    const sum = (arr) => arr.reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0);

    const renderTable = (rows) => {
        tabla.innerHTML = "";
        rows.forEach((r, idx) => {
            const tr = document.createElement("tr");

            const tdFecha = document.createElement("td");
            tdFecha.textContent = r.Fecha || "";
            tr.appendChild(tdFecha);

            const tdArn = document.createElement("td");
            tdArn.textContent = r.ARN || "";
            tr.appendChild(tdArn);

            const tdAuth = document.createElement("td");
            tdAuth.textContent = r.Autorizacion || "";
            tr.appendChild(tdAuth);

            const tdTxn = document.createElement("td");
            tdTxn.textContent = r.TxnId || "";
            tr.appendChild(tdTxn);

            const tdMin = document.createElement("td");
            tdMin.textContent = r.MontoInterno?.toFixed(2) ?? "";
            tr.appendChild(tdMin);

            const tdMex = document.createElement("td");
            tdMex.textContent = r.MontoExterno?.toFixed(2) ?? "";
            tr.appendChild(tdMex);

            const tdDiff = document.createElement("td");
            tdDiff.textContent = r.Diferencia?.toFixed(2) ?? "";
            tr.appendChild(tdDiff);

            const tdEstado = document.createElement("td");
            tdEstado.textContent = r.Estado;
            tr.appendChild(tdEstado);

            const tdAcc = document.createElement("td");
            tdAcc.innerHTML = `
        <label>
          <input type="checkbox" class="row-select" data-index="${idx}">
          Seleccionar
        </label>
      `;
            tr.appendChild(tdAcc);

            // Color según estado
            if (r.Estado === "OK") tr.style.opacity = 0.85;
            if (r.Estado === "Monto distinto") tr.style.background = "rgba(255, 193, 7, 0.15)";
            if (r.Estado === "Faltante Interno" || r.Estado === "Faltante Externo")
                tr.style.background = "rgba(220, 53, 69, 0.12)";

            tabla.appendChild(tr);
        });
    };

    const updateKPIs = (rows) => {
        const totalInt = sum(rows.map((r) => r.MontoInterno || 0));
        const totalExt = sum(rows.map((r) => r.MontoExterno || 0));
        const diffs = rows.filter((r) => r.Estado !== "OK" && r.Estado !== "Conciliada").length;

        kpiInterno.textContent = totalInt.toFixed(2);
        kpiExterno.textContent = totalExt.toFixed(2);
        kpiDiff.textContent = String(diffs);
    };

    const ejecutarConciliacion = () => {
        // 1) filtros de fecha
        const dFrom = desdeEl.value ? new Date(desdeEl.value) : null;
        const dTo = hastaEl.value ? new Date(hastaEl.value) : null;

        const fInt = rowsInterno.filter((r) => inDateRange(r, dFrom, dTo));
        const fExt = rowsExterno.filter((r) => inDateRange(r, dFrom, dTo));

        // 2) indexar por clave ARN|Autorizacion
        const mapInt = new Map();
        fInt.forEach((r) => {
            mapInt.set(keyFor(r), r);
        });

        const mapExt = new Map();
        fExt.forEach((r) => {
            mapExt.set(keyFor(r), r);
        });

        // 3) union de claves
        const claves = new Set([...mapInt.keys(), ...mapExt.keys()]);

        // 4) construir resultado

        const out = [];
        claves.forEach((k) => {
            const iR = mapInt.get(k);
            const eR = mapExt.get(k);
            out.push(buildOutRow(iR, eR));
        });
        resultado = out.sort((a, b) => (parseDate(a.Fecha) - parseDate(b.Fecha)) || String(a.TxnId).localeCompare(String(b.TxnId)));


        resultado = out.sort((a, b) => (parseDate(a.Fecha) - parseDate(b.Fecha)) || String(a.ARN).localeCompare(String(b.ARN)));
        renderTable(resultado);
        updateKPIs(resultado);
    };

    const exportarDiscrepancias = () => {
        const diffs = resultado.filter((r) => r.Estado !== "OK" && r.Estado !== "Conciliada");
        if (!diffs.length) {
            alert("No hay discrepancias para exportar.");
            return;
        }
        const headers = ["Fecha", "ARN", "Autorizacion", "Monto Interno", "Monto Externo", "Diferencia", "Estado"];
        const lines = [headers.join(",")];

        diffs.forEach((r) => {
            lines.push([
                r.Fecha ?? "",
                r.ARN ?? "",
                r.Autorizacion ?? "",
                r.MontoInterno ?? "",
                r.MontoExterno ?? "",
                r.Diferencia ?? "",
                r.Estado ?? "",
            ].join(","));
        });

        const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const now = new Date();
        const stamp = now.toISOString().slice(0, 19).replace(/[:T]/g, "-");
        a.download = `discrepancias-${stamp}.csv`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
    };

    const marcarConciliadas = () => {
        const checks = document.querySelectorAll(".row-select:checked");
        if (!checks.length) {
            alert("Selecciona al menos una fila.");
            return;
        }
        checks.forEach((chk) => {
            const idx = Number(chk.dataset.index);
            if (Number.isInteger(idx) && resultado[idx]) {
                resultado[idx].Estado = "Conciliada";
            }
        });
        renderTable(resultado);
        updateKPIs(resultado);
    };

    // ---- Eventos
    btnEjecutar?.addEventListener("click", async () => {
        try {
            const [intRows, extRows] = await Promise.all([
                readCSVFile(arcIntEl.files?.[0]),
                readCSVFile(arcExtEl.files?.[0]),
            ]);
            rowsInterno = intRows;
            rowsExterno = extRows;

            if (!rowsInterno.length || !rowsExterno.length) {
                if (!rowsInterno.length) alert("No se pudo leer el Archivo interno o está vacío.");
                if (!rowsExterno.length) alert("No se pudo leer el Archivo externo o está vacío.");
            }
            ejecutarConciliacion();
        } catch (e) {
            console.error(e);
            alert("Error al leer archivos. Asegúrate de subir CSV válidos.");
        }
    });

    btnExportar?.addEventListener("click", exportarDiscrepancias);
    btnMarcar?.addEventListener("click", marcarConciliadas);

    // (Opcional) Poblar lista de entidades según tipo
    tipoEntidadEl?.addEventListener("change", () => {
        entidadEl.innerHTML = `<option value="">Seleccione...</option>`;
        const tipo = tipoEntidadEl.value;
        const cat = {
            adquirente: ["Adq-01", "Adq-02", "Adq-03"],
            emisor: ["Emi-01", "Emi-02", "Emi-03"],
        }[tipo] || [];
        cat.forEach((v) => {
            const opt = document.createElement("option");
            opt.value = v;
            opt.textContent = v;
            entidadEl.appendChild(opt);
        });
    });
});