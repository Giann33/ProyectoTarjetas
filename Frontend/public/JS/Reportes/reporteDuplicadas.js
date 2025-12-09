// Frontend/public/js/reportes/reporteDuplicadas.js
(function () {
  var API = 'http://localhost:8081/api/reportes/reporte-duplicadas';
  var pagina = 1, tamano = 10;

  function qs(id){ return document.getElementById(id); }
  function formatearCRC(n){
    try { return new Intl.NumberFormat('es-CR').format(n); }
    catch(e){ return n; }
  }

  function params() {
    var p = new URLSearchParams();
    p.set('fechaInicio', qs('fInicio').value);
    p.set('fechaFin', qs('fFin').value);
    p.set('pagina', String(pagina));
    p.set('tamano', String(tamano));   // mismo que en controller
    return p.toString();
  }

  function render(data){
    var tbody = qs('grid');
    tbody.innerHTML = (data.items || []).map(function(x){
      return '<tr>'
        + '<td>' + x.idTransaccion + '</td>'
        + '<td>' + x.servicio      + '</td>'
        + '<td>' + x.comercio      + '</td>'
        + '<td>' + formatearCRC(x.monto) + '</td>'
        + '<td>' + x.fecha         + '</td>'
        + '<td>' + x.motivo        + '</td>'
        + '</tr>';
    }).join('');

    var p = qs('paginacion');
    if (p) {
      p.textContent = 'Página ' + data.pagina + ' / ' + data.totalPaginas +
                      ' - Total ítems: ' + data.totalItems;
    }
  }

  function cargar(){
    var fi = qs('fInicio').value, ff = qs('fFin').value;
    if(!fi || !ff){ alert('Debe seleccionar ambas fechas'); return; }
    if(fi > ff){ alert('La fecha inicio no puede ser mayor que la fecha fin'); return; }

    fetch(API + '?' + params(), { headers:{'Content-Type':'application/json'} })
      .then(function(r){
        if(!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(render)
      .catch(function(err){
        alert('Error cargando reporte: ' + err.message);
      });
  }

  function exportar(){
    // Tomamos las filas que ya están renderizadas en el tbody
    var trs = document.querySelectorAll('#grid tr');
    if (!trs.length) {
      alert('No hay datos para exportar.');
      return;
    }

    // Encabezados tal como están en el HTML
    var headers = [
      'ID Transacción',
      'Servicio',
      'Comercio',
      'Monto',
      'Fecha',
      'Motivo'
    ];

    // Construimos un HTML de tabla para que Excel lo interprete como libro
    var html = '<html><head><meta charset="UTF-8"></head><body>';
    html += '<table border="1"><thead><tr>';

    headers.forEach(function(h){
      html += '<th>' + h + '</th>';
    });

    html += '</tr></thead><tbody>';

    // Recorremos cada fila de la tabla visible
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

    // Creamos el blob como "Excel"
    var blob = new Blob([html], {
      type: 'application/vnd.ms-excel;charset=utf-8;'
    });

    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var hoy = new Date().toISOString().slice(0,10);

    a.href = url;
    a.download = 'ReporteOperacionesDuplicadas_' + hoy + '.xls';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function init(){
    var hoy = new Date();
    var h7  = new Date();
    h7.setDate(hoy.getDate() - 7);

    qs('fInicio').value = h7.toISOString().slice(0,10);
    qs('fFin').value    = hoy.toISOString().slice(0,10);

    qs('btnBuscar').onclick   = function(){ pagina = 1; cargar(); };
    qs('btnExportar').onclick = exportar;

    cargar();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();





