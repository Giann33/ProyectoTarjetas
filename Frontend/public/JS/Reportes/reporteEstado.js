// Frontend/public/js/reportes/reporteEstado.js

(function () {
  // Backend en 8081
  var API = 'http://localhost:8081/api/reportes/reporte-estado';
  var pagina = 1;
  var tamano = 10;

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
    p.set('tamano', String(tamano));   // mismo nombre que en el controller
    p.set('orden', orden);
    return p.toString();
  }

  function renderTabla(items) {
    var tbody = qs('grid');
    tbody.innerHTML = items.map(function (x) {
      return (
        '<tr>' +
          '<td>' + x.estado   + '</td>' +
          '<td>' + x.servicio + '</td>' +
          '<td>' + x.comercio + '</td>' +
          '<td>' + formatearCRC(x.monto) + '</td>' +
          '<td>' + x.fecha    + '</td>' +
          '<td>' + x.factura  + '</td>' +
        '</tr>'
      );
    }).join('');
  }

  function renderPaginacion(data) {
    var el = qs('paginacion');
    if (!el) return;
    el.textContent = 'Página ' + data.pagina + ' / ' + data.totalPaginas +
                     ' - Total ítems: ' + data.totalItems;
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

  // ======== Helpers XLSX (mismo de antes) ========
  function exportToXLSXEstado(filename, headers, rows) {
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

    sheetRows += "<row>";
    headers.forEach(function(h, i) {
      var ref = colLetter(i) + "1";
      sheetRows += '<c r="' + ref + '" t="inlineStr"><is><t>' + esc(h) + '</t></is></c>';
    });
    sheetRows += "</row>";

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
            '<sheet name="Estado" sheetId="1" r:id="rId1"/>' +
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

  function exportarXLSX() {
    var trs = document.querySelectorAll('#grid tr');
    if (!trs.length) {
      alert('No hay datos para exportar.');
      return;
    }

    var headers = ['Estado', 'Servicio', 'Comercio', 'Monto', 'Fecha', 'Factura'];
    var rows = Array.from(trs).map(function (tr) {
      return Array.from(tr.children).map(function (td) { return td.textContent; });
    });

    exportToXLSXEstado('ReporteEstado', headers, rows);
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
      btnExportar.onclick = exportarXLSX;
    }
  }

  function init() {
    var hoy = new Date().toISOString().slice(0,10);
    var fFecha = qs('fFecha');
    if (fFecha && !fFecha.value) fFecha.value = hoy;

    wireEvents();
    cargar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();




