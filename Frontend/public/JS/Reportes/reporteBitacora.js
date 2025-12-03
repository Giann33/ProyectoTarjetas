// public/js/reportes/reporteBitacora.js

(function () {

  var API = '/api/reportes/bitacora';
  var pagina = 1;
  var tamaño = 10;

  function qs(id) { return document.getElementById(id); }

  function construirParams() {
    var fi = qs('fInicio').value;
    var ff = qs('fFin').value;
    var modulo = qs('fModulo').value;

    var p = new URLSearchParams();
    p.set('fechaInicio', fi);
    p.set('fechaFin', ff);
    p.set('modulo', modulo);
    p.set('pagina', pagina);
    p.set('tamaño', tamaño);

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
          <td>${x.usuario}</td>
          <td>${x.correo}</td>
          <td>${x.rol}</td>
          <td>${x.idReporte}</td>
          <td>${x.idTransaccion}</td>
          <td>${x.estadoTransaccion}</td>
          <td>${x.tipoTransaccion}</td>
          <td>${x.servicio}</td>
          <td>${x.moneda}</td>
          <td>${x.monto ?? ''}</td>
        </tr>
      `;
    }).join('');
  }

  function renderPaginacion(data) {
    var el = qs('paginacion');
    el.textContent = `Página ${data.pagina} / ${data.totalPaginas} — Total: ${data.totalItems}`;
  }

  function cargar() {
    var url = API + '?' + construirParams();
    fetch(url)
      .then(r => r.json())
      .then(data => {
        renderTabla(data.items);
        renderPaginacion(data);
      })
      .catch(err => alert('Error cargando: ' + err.message));
  }

  // EXPORTACIÓN XLSX REUTILIZADA
  function exportar() {
    var trs = document.querySelectorAll('#grid tr');
    if (!trs.length) { alert('No hay datos.'); return; }

    var headers = [
      'Fecha','Módulo','Acción','Usuario','Correo','Rol',
      'ID Reporte','ID Transacción','Estado','Tipo',
      'Servicio','Moneda','Monto'
    ];

    var rows = Array.from(trs).map(tr =>
      Array.from(tr.children).map(td => td.textContent)
    );

    exportToXLSX('Bitacora', headers, rows);
  }

  function wireEvents() {
    qs('btnBuscar').onclick = () => { pagina = 1; cargar(); };
    qs('btnExportar').onclick = exportar;
  }

  function init() {
    let hoy = new Date().toISOString().slice(0,10);
    qs('fInicio').value = hoy;
    qs('fFin').value = hoy;

    wireEvents();
    cargar();
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
  else
    init();

})();

