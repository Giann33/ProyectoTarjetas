// Frontend/public/js/reportes/reporteBitacora.js
(function () {
  var API = '/api/reportes/reporte-bitacora';
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
    var fi = qs('fInicio').value;
    var ff = qs('fFin').value;
    var modulo = qs('fModulo').value.trim();
    if (!modulo) modulo = 'TODOS';

    var p = new URLSearchParams();
    p.set('fechaInicio', fi);
    p.set('fechaFin', ff);
    p.set('modulo', modulo);
    p.set('pagina', String(pagina));
    p.set('tamanio', String(tamanio));
    return p.toString();
  }

  function renderTabla(items) {
    var tbody = qs('grid');
    tbody.innerHTML = (items || []).map(function (x) {
      return '' +
        '<tr>' +
          '<td>' + x.fecha + '</td>' +
          '<td>' + x.modulo + '</td>' +
          '<td>' + x.nombreCompleto + ' (ID ' + x.idUsuario + ')</td>' +
          '<td>' + x.rol + '</td>' +
          '<td>' + x.correo + '</td>' +
          '<td>' + x.idTransaccion + '</td>' +
          '<td>' + x.estadoTransaccion + '</td>' +
          '<td>' + x.tipoTransaccion + '</td>' +
          '<td>' + x.servicio + '</td>' +
          '<td>' + (x.monto != null ? formatearCRC(x.monto) : '') + '</td>' +
          '<td>' + (x.moneda || '') + '</td>' +
          '<td class="col-accion">' + x.accion + '</td>' +
        '</tr>';
    }).join('');
  }

  function renderPaginacion(data) {
    var el = qs('paginacion');
    if (!el) return;
    el.textContent = 'Pagina ' + data.pagina + ' / ' + data.totalPaginas +
                     ' - Total items: ' + data.totalItems;
  }

  function cargar() {
    var fi = qs('fInicio').value;
    var ff = qs('fFin').value;
    if (!fi || !ff) {
      alert('Debe seleccionar fecha inicio y fecha fin');
      return;
    }
    if (fi > ff) {
      alert('La fecha inicio no puede ser mayor que la fecha fin');
      return;
    }

    var url = API + '?' + construirParams();
    fetch(url, { headers: { 'Content-Type': 'application/json' } })
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

  // ================== XLSX helpers (JSZip) ==================
  function escXml(v) {
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

  function exportToXLSXBitacora(filename, headers, rows) {
    var sheetRows = "";

    // Encabezado
    sheetRows += "<row>";
    headers.forEach(function (h, i) {
      var ref = colLetter(i) + "1";
      sheetRows += '<c r="' + ref + '" t="inlineStr"><is><t>' +
                   escXml(h) +
                   '</t></is></c>';
    });
    sheetRows += "</row>";

    // Filas
    rows.forEach(function (row, rIndex) {
      var rowNumber = rIndex + 2;
      sheetRows += "<row>";
      row.forEach(function (cell, cIndex) {
        var ref = colLetter(cIndex) + rowNumber;
        sheetRows += '<c r="' + ref + '" t="inlineStr"><is><t>' +
                     escXml(cell) +
                     '</t></is></c>';
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
            '<sheet name="Bitacora" sheetId="1" r:id="rId1"/>' +
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
    Object.keys(files).forEach(function (path) {
      zip.file(path, files[path]);
    });

    zip.generateAsync({ type: "blob" }).then(function (blob) {
      var link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename.endsWith(".xlsx") ? filename : filename + ".xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    });
  }

  function exportar() {
    var trs = document.querySelectorAll('#grid tr');
    if (!trs.length) {
      alert('No hay datos para exportar.');
      return;
    }

    var headers = [
      'Fecha','Módulo','Usuario','Rol','Correo',
      'ID Transacción','Estado','Tipo','Servicio',
      'Monto','Moneda','Acción'
    ];

    var rows = Array.from(trs).map(function (tr) {
      return Array.from(tr.children).map(function (td) {
        return td.textContent;
      });
    });

    exportToXLSXBitacora('ReporteBitacora', headers, rows);
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
      btnExportar.onclick = exportar;
    }
  }

  function init() {
    // Rango inicial: últimos 7 días
    var hoy = new Date();
    var h7  = new Date();
    h7.setDate(hoy.getDate() - 7);

    if (qs('fInicio')) qs('fInicio').value = h7.toISOString().slice(0, 10);
    if (qs('fFin'))    qs('fFin').value    = hoy.toISOString().slice(0, 10);

    wireEvents();
    cargar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
