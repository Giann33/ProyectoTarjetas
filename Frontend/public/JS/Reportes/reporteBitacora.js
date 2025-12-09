// Frontend/public/js/reportes/reporteBitacora.js

(function () {

  var API = 'http://localhost:8081/api/reportes/reporte-bitacora';
  var pagina = 1;
  var tamano = 10;

  function qs(id) { return document.getElementById(id); }

  function construirParams() {
    var fi = qs('fInicio').value;
    var ff = qs('fFin').value;
    var modulo = qs('fModulo').value;

    var p = new URLSearchParams();
    p.set('fechaInicio', fi);
    p.set('fechaFin', ff);
    p.set('modulo', modulo);
    p.set('pagina', String(pagina));
    p.set('tamano', String(tamano));

    return p.toString();
  }

  function renderTabla(items) {
    var tbody = qs('grid');
    tbody.innerHTML = items.map(function (x) {

      return `
        <tr>
          <td>${x.fecha}</td>
          <td>${x.modulo}</td>
          <td>${x.accion}</td>
          <td>${x.nombreUsuario}</td>
          <td>${x.correoUsuario}</td>
          <td>${x.rolUsuario}</td>
          <td>${x.idReporte}</td>
          <td>${x.idTransaccion}</td>
          <td>${x.estadoTransaccion}</td>
          <td>${x.tipoTransaccion}</td>
          <td>${x.servicio}</td>
          <td>${x.comercio}</td>
          <td>${x.moneda}</td>
          <td>${x.monto ?? ''}</td>
        </tr>
      `;
    }).join('');
  }

  function renderPaginacion(data) {
    var el = qs('paginacion');
    if (!el) return;
    el.textContent = `Página ${data.pagina} / ${data.totalPaginas} — Total: ${data.totalItems}`;
  }

  function cargar() {
    var url = API + '?' + construirParams();
    fetch(url)
      .then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function(data) {
        renderTabla(data.items || []);
        renderPaginacion(data);
      })
      .catch(function(err) {
        alert('Error cargando: ' + err.message);
      });
  }

  function exportar() {
  var trs = document.querySelectorAll('#grid tr');
  if (!trs.length) {
    alert('No hay datos.');
    return;
  }

  // Encabezados (los mismos que usas en la tabla)
  var headers = [
    'Fecha','Módulo','Acción','Usuario','Correo','Rol',
    'ID Reporte','ID Transacción','Estado','Tipo',
    'Servicio','Comercio','Moneda','Monto'
  ];

  // Construimos un HTML de tabla para que Excel lo interprete como libro
  var html = '<html><head><meta charset="UTF-8"></head><body>';
  html += '<table border="1"><thead><tr>';

  headers.forEach(function(h){
    html += '<th>' + h + '</th>';
  });

  html += '</tr></thead><tbody>';

  trs.forEach(function(tr){
    html += '<tr>';
    Array.from(tr.children).forEach(function(td){
      var texto = td.textContent.replace(/\s+/g, ' ').trim();

      // Escapar caracteres especiales básicos
      texto = texto
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      html += '<td>' + texto + '</td>';
    });
    html += '</tr>';
  });

  html += '</tbody></table></body></html>';

  // Blob como Excel antiguo (lo abre perfecto)
  var blob = new Blob([html], {
    type: 'application/vnd.ms-excel;charset=utf-8;'
  });

  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  var hoy = new Date().toISOString().slice(0,10);

  a.href = url;
  a.download = 'ReporteBitacora_' + hoy + '.xls'; // ya no es .csv
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

  function wireEvents() {
  qs('btnBuscar').onclick   = function(){ pagina = 1; cargar(); };
  qs('btnExportar').onclick = exportar;   // SOLO esta línea para exportar
}

  function exportarExcel() {
    const tabla = document.getElementById("tablaBitacora");
    if (!tabla) {
        alert("No se encontró la tabla para exportar.");
        return;
    }

    let filas = [];

    // ---- Encabezados ----
    const ths = tabla.querySelectorAll("thead th");
    let encabezados = [];
    ths.forEach(th => {
        encabezados.push('"' + th.innerText.trim().replace(/"/g, '""') + '"');
    });
    filas.push(encabezados.join(";"));

    // ---- Filas del cuerpo ----
    const trs = tabla.querySelectorAll("tbody tr");
    trs.forEach(tr => {
        let columnas = [];
        tr.querySelectorAll("td").forEach(td => {
            const texto = td.innerText.trim().replace(/\s+/g, ' ');
            columnas.push('"' + texto.replace(/"/g, '""') + '"');
        });
        filas.push(columnas.join(";"));
    });

    // ---- Unir CSV ----
    const csv = filas.join("\r\n");

    // BOM para acentos sin fallos
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    const hoy = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = "Reporte_Bitacora_" + hoy + ".csv";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

  function init() {
    var hoy = new Date().toISOString().slice(0,10);
    qs('fInicio').value = hoy;
    qs('fFin').value    = hoy;

    wireEvents();
    cargar();
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
  else
    init();

})();

