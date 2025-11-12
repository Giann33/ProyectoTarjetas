(function () {
  var API = '/api/reportes/reporte-notificaciones';
  var pagina = 1, tamanio = 10;

  function qs(id){ return document.getElementById(id); }

  function params(){
    var p = new URLSearchParams();
    p.set('fechaInicio', qs('fInicio').value);
    p.set('fechaFin', qs('fFin').value);
    p.set('pagina', String(pagina));
    p.set('tamanio', String(tamanio));
    return p.toString();
  }

  function render(data){
    qs('grid').innerHTML = (data.items||[]).map(function(x){
      return '<tr>'
        + '<td>' + x.idNotificacion + '</td>'
        + '<td>' + x.tipo + '</td>'
        + '<td>' + x.destinatario + '</td>'
        + '<td>' + x.estado + '</td>'
        + '<td>' + x.fechaEnvio + '</td>'
        + '</tr>';
    }).join('');
    var p = qs('paginacion');
    if(p) p.textContent = 'Pagina ' + data.pagina + ' / ' + data.totalPaginas + ' - Total items: ' + data.totalItems;
  }

  function cargar(){
    var fi = qs('fInicio').value, ff = qs('fFin').value;
    if(!fi || !ff){ alert('Debe seleccionar ambas fechas'); return; }
    if(fi > ff){ alert('La fecha inicio no puede ser mayor que la fecha fin'); return; }

    fetch(API + '?' + params(), { headers:{'Content-Type':'application/json'} })
      .then(function(r){ if(!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(render)
      .catch(function(err){ alert('Error cargando reporte: ' + err.message); });
  }

  function exportar(){
    var filas = Array.from(document.querySelectorAll('#grid tr')).map(function(tr){
      return Array.from(tr.children).map(function(td){ return td.textContent; });
    });
    var csv = [['ID Notificacion','Tipo','Destinatario','Estado','Fecha Envio']].concat(filas)
      .map(function(row){ return row.map(function(c){ c=String(c).replace(/"/g,'""'); return '"'+c+'"'; }).join(','); })
      .join('\n');

    var blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'ReporteNotificaciones.csv'; a.click();
  }

  function init(){
    var hoy = new Date(), h7 = new Date(); h7.setDate(hoy.getDate()-7);
    qs('fInicio').value = h7.toISOString().slice(0,10);
    qs('fFin').value = hoy.toISOString().slice(0,10);

    qs('btnBuscar').onclick = function(){ pagina = 1; cargar(); };
    qs('btnExportar').onclick = exportar;

    cargar();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
