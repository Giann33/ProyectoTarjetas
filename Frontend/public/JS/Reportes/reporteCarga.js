(function () {
  var API = '/api/reportes/reporte-carga';

  function qs(id){ return document.getElementById(id); }

  function cargar(){
    var p = new URLSearchParams(); p.set('rango', qs('fRango').value);
    fetch(API + '?' + p.toString(), { headers:{'Content-Type':'application/json'} })
      .then(function(r){ if(!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function(data){
        qs('grid').innerHTML = (data.serie||[]).map(function(p){
          return '<tr><td>' + p.hora + '</td><td>' + p.trafico + '</td></tr>';
        }).join('');
      })
      .catch(function(err){ alert('Error cargando reporte: ' + err.message); });
  }

  function exportar(){
    var filas = Array.from(document.querySelectorAll('#grid tr')).map(function(tr){
      return Array.from(tr.children).map(function(td){ return td.textContent; });
    });
    var csv = [['Hora','Trafico']].concat(filas)
      .map(function(row){ return row.join(','); })
      .join('\n');
    var blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'ReporteCarga.csv'; a.click();
  }

  function init(){
    qs('btnBuscar').onclick = cargar;
    qs('btnExportar').onclick = exportar;
    cargar();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
