// Frontend/public/js/reportes/reporteEstado.js

(function () {
  var API = '/api/reportes/reporte-estado';
  var pagina = 1;
  var tamanio = 10;

  function qs(id) { return document.getElementById(id); }

  function formatearCRC(n) {
    try {
      return new Intl.NumberFormat('es-CR').format(n);
    } catch (e) {
      return n;
    }
  }

  function construirParams() {
    var fecha  = qs('fFecha').value || new Date().toISOString().slice(0,10);
    var estado = qs('fEstado').value;
    var orden  = qs('fOrden').value;

    var p = new URLSearchParams();
    p.set('fecha', fecha);
    p.set('estado', estado);
    p.set('pagina', String(pagina));
    p.set('tamanio', String(tamanio));
    p.set('orden', orden);
    return p.toString();
  }

  function renderTabla(items) {
    var tbody = qs('grid');
    tbody.innerHTML = items.map(function (x) {
      return (
        '<tr>' +
          '<td>' + x.estado + '</td>' +
          '<td>' + x.comercio + '</td>' +
          '<td>' + formatearCRC(x.monto) + '</td>' +
          '<td>' + x.fecha + '</td>' +
          '<td>' + x.factura + '</td>' +
        '</tr>'
      );
    }).join('');
  }

  function renderPaginacion(data) {
    var el = qs('paginacion');
    if (!el) return;
    el.textContent = 'Pagina ' + data.pagina + ' / ' + data.totalPaginas + ' - Total items: ' + data.totalItems;
  }

  function cargar() {
    var url = API + '?' + construirParams();
    return fetch(url, { headers: { 'Content-Type': 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        renderTabla(data.items || []);
        renderPaginacion(data);
      })
      .catch(function (err) {
        alert('Error cargando reporte: ' + err.message);
      });
  }

  function exportarCSV() {
    var filas = Array.from(document.querySelectorAll('#grid tr'))
      .map(function (tr) { return Array.from(tr.children).map(function (td) { return td.textContent; }); });

    var encabezado = ['Estado', 'Comercio', 'Monto', 'Fecha', 'Factura'];
    var csv = [encabezado].concat(filas)
      .map(function (arr) {
        return arr.map(function (campo) {
          var v = String(campo).replace(/"/g, '""');
          return '"' + v + '"';
        }).join(',');
      })
      .join('\n');

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'ReporteEstado.csv';
    a.click();
  }

  function wireEvents() {
    var btnBuscar = qs('btnBuscar');
    var btnExportar = qs('btnExportar');

    if (btnBuscar) {
      btnBuscar.onclick = function () {
        pagina = 1;
        cargar();
      };
    }
    if (btnExportar) {
      btnExportar.onclick = exportarCSV;
    }
  }

  function init() {
    // valores iniciales
    var hoy = new Date().toISOString().slice(0,10);
    var fFecha = qs('fFecha');
    if (fFecha && !fFecha.value) fFecha.value = hoy;

    wireEvents();
    cargar();
  }

  // Espera a que el DOM esté listo por si el script se carga en <head>
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
