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

    var headers = [
      'Fecha','Módulo','Acción','Usuario','Correo','Rol',
      'ID Reporte','ID Transacción','Estado','Tipo',
      'Servicio','Comercio','Moneda','Monto'
    ];

    var rows = Array.from(trs).map(function(tr) {
      return Array.from(tr.children).map(function(td){ return td.textContent; });
    });

    var csv = [headers].concat(rows)
      .map(function(row){
        return row.map(function(c){
          c = String(c).replace(/"/g,'""');
          return '"' + c + '"';
        }).join(',');
      })
      .join('\n');

    var blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'ReporteBitacora.csv';
    a.click();
  }

  function wireEvents() {
    qs('btnBuscar').onclick   = function(){ pagina = 1; cargar(); };
    qs('btnExportar').onclick = exportar;
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

