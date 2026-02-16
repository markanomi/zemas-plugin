(function () {
  var cs = (typeof CSInterface !== "undefined") ? new CSInterface() : null;
  var autoRefreshTimer = null;
  var latestRows = [];

  var ui = {
    unit: document.getElementById("unitSelect"),
    decimals: document.getElementById("decimalsInput"),
    showGeo: document.getElementById("geoCheckbox"),
    autoRefresh: document.getElementById("autoRefreshCheckbox"),
    refreshBtn: document.getElementById("refreshBtn"),
    writeLabelsBtn: document.getElementById("writeLabelsBtn"),
    clearLabelsBtn: document.getElementById("clearLabelsBtn"),
    copyCsvBtn: document.getElementById("copyCsvBtn"),
    status: document.getElementById("status"),
    tbody: document.querySelector("#resultTable tbody")
  };

  ui.refreshBtn.addEventListener("click", refresh);
  ui.writeLabelsBtn.addEventListener("click", writeLabels);
  ui.clearLabelsBtn.addEventListener("click", clearLabels);
  ui.copyCsvBtn.addEventListener("click", copyCsv);
  ui.autoRefresh.addEventListener("change", onAutoRefreshToggle);

  refresh();

  function setStatus(text) {
    ui.status.textContent = text;
  }

  function callHost(fnCall, onDone) {
    if (!cs) {
      setStatus("CSInterface bulunamadı (sadece CEP içinde çalışır).");
      return;
    }
    cs.evalScript(fnCall, function (result) {
      onDone(result);
    });
  }

  function currentOptions() {
    return {
      unit: ui.unit.value,
      decimals: Number(ui.decimals.value || 2),
      showGeometric: !!ui.showGeo.checked
    };
  }

  function refresh() {
    setStatus("Ölçülüyor...");
    var opts = currentOptions();
    var arg = JSON.stringify(opts).replace(/\\/g, "\\\\").replace(/'/g, "\\'");

    callHost("zemasMeasure.getSelectionJson('" + arg + "')", function (raw) {
      try {
        var data = JSON.parse(raw || "{}");
        if (data.error) {
          setStatus("Hata: " + data.error);
          renderRows([]);
          return;
        }

        latestRows = data.rows || [];
        renderRows(latestRows, data.showGeometric);
        setStatus("Öğe: " + (data.rows ? data.rows.length : 0));
      } catch (e) {
        setStatus("Parse hatası: " + e.message);
      }
    });
  }

  function renderRows(rows, showGeometric) {
    ui.tbody.innerHTML = "";

    rows.forEach(function (row, idx) {
      var tr = document.createElement("tr");
      tr.innerHTML = [
        "<td>" + (idx + 1) + "</td>",
        "<td>" + escapeHtml(row.label || "") + "</td>",
        "<td>" + escapeHtml(row.visibleText || "") + "</td>",
        "<td>" + (showGeometric ? escapeHtml(row.geometricText || "") : "-") + "</td>"
      ].join("");
      ui.tbody.appendChild(tr);
    });
  }

  function writeLabels() {
    callHost("zemasMeasure.writeLabels()", function (raw) {
      setStatus(raw || "Etiket işlemi tamamlandı.");
      refresh();
    });
  }

  function clearLabels() {
    callHost("zemasMeasure.clearLabels()", function (raw) {
      setStatus(raw || "Etiketler temizlendi.");
      refresh();
    });
  }

  function copyCsv() {
    var lines = ["index,label,visible,geometric"];
    latestRows.forEach(function (row, idx) {
      lines.push([
        idx + 1,
        csvCell(row.label || ""),
        csvCell(row.visibleText || ""),
        csvCell(row.geometricText || "")
      ].join(","));
    });

    navigator.clipboard.writeText(lines.join("\n"))
      .then(function () { setStatus("CSV panoya kopyalandı."); })
      .catch(function () { setStatus("Panoya kopyalama başarısız."); });
  }

  function onAutoRefreshToggle() {
    if (ui.autoRefresh.checked) {
      autoRefreshTimer = window.setInterval(refresh, 1000);
      setStatus("Otomatik yenileme açık.");
    } else {
      window.clearInterval(autoRefreshTimer);
      autoRefreshTimer = null;
      setStatus("Otomatik yenileme kapalı.");
    }
  }

  function csvCell(text) {
    var escaped = String(text).replace(/"/g, '""');
    return '"' + escaped + '"';
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
