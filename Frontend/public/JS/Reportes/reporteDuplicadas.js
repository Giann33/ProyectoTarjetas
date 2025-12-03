// Frontend/public/js/reportes/reporteDuplicadas.js
(function () {
  var API = '/api/reportes/reporte-duplicadas';
  var pagina = 1, tamanio = 10;

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
    p.set('tamanio', String(tamanio));
    return p.toString();
  }

  function render(data){
    var tbody = qs('grid');
    tbody.innerHTML = (data.items || []).map(function(x){
      return '<tr>'
        + '<td>' + x.idTransaccion + '</td>'
        + '<td>' + x.servicio + '</td>'
        + '<td>' + x.comercio + '</td>'
        + '<td>' + formatearCRC(x.monto) + '</td>'
        + '<td>' + x.fecha + '</td>'
        + '<td>' + x.motivo + '</td>'
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
    var filas = Array.from(document.querySelectorAll('#grid tr')).map(function(tr){
      return Array.from(tr.children).map(function(td){ return td.textContent; });
    });

    // Encabezados actualizados con Servicio + Comercio
    var encabezado = ['ID Transacción','Servicio','Comercio','Monto','Fecha','Motivo'];

    var csv = [encabezado].concat(filas)
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
    a.download = 'ReporteDuplicadas.csv';
    a.click();
  }

  function init(){
    var hoy = new Date();
    var h7  = new Date();
    h7.setDate(hoy.getDate() - 7);

    qs('fInicio').value = h7.toISOString().slice(0,10);
    qs('fFin').value    = hoy.toISOString().slice(0,10);

    qs('btnBuscar').onclick  = function(){ pagina = 1; cargar(); };
    qs('btnExportar').onclick = exportar;

    cargar();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


