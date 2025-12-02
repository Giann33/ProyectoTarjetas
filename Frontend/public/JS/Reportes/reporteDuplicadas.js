(function () {
  var API = '/api/reportes/reporte-duplicadas';
  var pagina = 1, tamanio = 10;

  function qs(id){ return document.getElementById(id); }
  function formatearCRC(n){ try { return new Intl.NumberFormat('es-CR').format(n); } catch(e){ return n; } }

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
    tbody.innerHTML = (data.items||[]).map(function(x){
      return '<tr>'
        + '<td>' + x.idTransaccion + '</td>'
        + '<td>' + x.comercio + '</td>'
        + '<td>' + formatearCRC(x.monto) + '</td>'
        + '<td>' + x.fecha + '</td>'
        + '<td>' + x.motivo + '</td>'
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

  // =========================
  // Helpers para exportar a XLSX
  // =========================
  function exportToXLSXDuplicadas(filename, headers, rows) {
    function esc(v) {
      return String(v == null ? "" : v)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    function colLetter(index) {
      var letters = "";
      var n = index;
      while (n >= 0) {
        letters = String.fromCharCode((n % 26) + 65) + letters;
        n = Math.floor(n / 26) - 1;
      }
      return letters;
    }

    var sheetRows = "";

    // Encabezados (fila 1)
    sheetRows += "<row>";
    headers.forEach(function(h, i) {
      var ref = colLetter(i) + "1";
      sheetRows += '<c r="' + ref + '" t="inlineStr"><is><t>' + esc(h) + '</t></is></c>';
    });
    sheetRows += "</row>";

    // Datos (desde fila 2)
    rows.forEach(function(row, rIndex) {
      var rowNumber = rIndex + 2;
      sheetRows += "<row>";
      row.forEach(function(cell, cIndex) {
        var ref = colLetter(cIndex) + rowNumber;
        sheetRows += '<c r="' + ref + '" t="inlineStr"><is><t>' + esc(cell) + '</t></is></c>';
      });
      sheetRows += "</row>";
    });

    var sheetData = "<sheetData>" + sheetRows + "</sheetData>";

    var files = {
      "[Content_Types].xml": (
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
          '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
          '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
          '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
          '<Default Extension="xml" ContentType="application/xml"/>' +
        '</Types>'
      ),
      "xl/workbook.xml": (
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
                  'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
          '<sheets>' +
            '<sheet name="Duplicadas" sheetId="1" r:id="rId1"/>' +
          '</sheets>' +
        '</workbook>'
      ),
      "xl/_rels/workbook.xml.rels": (
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" ' +
                       'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" ' +
                       'Target="worksheets/sheet1.xml"/>' +
        '</Relationships>'
      ),
      "xl/worksheets/sheet1.xml": (
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
          sheetData +
        '</worksheet>'
      ),
      "_rels/.rels": (
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" ' +
                       'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" ' +
                       'Target="xl/workbook.xml"/>' +
        '</Relationships>'
      )
    };

    var zip = new JSZip();
    Object.keys(files).forEach(function(path) {
      zip.file(path, files[path]);
    });

    zip.generateAsync({ type: "blob" }).then(function(blob) {
      var link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename.endsWith(".xlsx") ? filename : filename + ".xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    });
  }

  function exportar(){
    var trs = document.querySelectorAll('#grid tr');
    if (!trs.length) {
      alert('No hay datos para exportar.');
      return;
    }

    var headers = ['ID Transacción','Comercio','Monto','Fecha','Motivo'];
    var rows = Array.from(trs).map(function(tr){
      return Array.from(tr.children).map(function(td){ return td.textContent; });
    });

    exportToXLSXDuplicadas('ReporteDuplicadas', headers, rows);
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

