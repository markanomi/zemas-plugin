#target illustrator

/**
 * Seçili objelerin ölçülerini stroke dahil (visibleBounds) ve opsiyonel
 * geometricBounds ile raporlar.
 *
 * Not: Illustrator koordinat sisteminde bounds sırası [left, top, right, bottom]
 */
(function () {
    var DECIMALS = 2;
    var SHOW_GEOMETRIC = true;

    if (app.documents.length === 0) {
        alert("Açık doküman bulunamadı.");
        return;
    }

    var doc = app.activeDocument;
    var selection = doc.selection;

    if (!selection || selection.length === 0) {
        alert("Lütfen ölçmek için en az bir obje seçin.");
        return;
    }

    var lines = [];
    lines.push("Seçili Objeler Ölçü Raporu (Stroke Dahil)");
    lines.push("================================================");
    lines.push("Toplam seçili öğe: " + selection.length);
    lines.push("");

    var successCount = 0;
    var failCount = 0;

    for (var i = 0; i < selection.length; i++) {
        var item = selection[i];

        try {
            var visible = getBoundsSizePt(item, "visibleBounds");
            var geometric = SHOW_GEOMETRIC ? getBoundsSizePt(item, "geometricBounds") : null;

            var row = [];
            row.push((i + 1) + ") " + getItemLabel(item, i));
            row.push("   Visible : " + fmtMm(visible.widthPt, DECIMALS) + " x " + fmtMm(visible.heightPt, DECIMALS) + " mm");

            if (SHOW_GEOMETRIC && geometric) {
                row.push("   Geometric: " + fmtMm(geometric.widthPt, DECIMALS) + " x " + fmtMm(geometric.heightPt, DECIMALS) + " mm");
                row.push("   Fark     : +" + fmtMm(visible.widthPt - geometric.widthPt, DECIMALS) + " x +" + fmtMm(visible.heightPt - geometric.heightPt, DECIMALS) + " mm");
            }

            lines.push(row.join("\n"));
            lines.push("");
            successCount++;
        } catch (err) {
            lines.push((i + 1) + ") " + getItemLabel(item, i) + " -> Ölçü alınamadı: " + normalizeError(err));
            lines.push("");
            failCount++;
        }
    }

    lines.push("Özet: Başarılı " + successCount + " | Hatalı " + failCount);

    var report = lines.join("\n");
    alert(report);

    try {
        $.writeln(report);
    } catch (ignore) {
        // ExtendScript console kapalı olabilir; sessiz geç.
    }

    function getBoundsSizePt(pageItem, boundsKey) {
        if (!pageItem || !pageItem[boundsKey]) {
            throw new Error(boundsKey + " okunamadı");
        }

        var b = pageItem[boundsKey];
        if (!b || b.length !== 4) {
            throw new Error(boundsKey + " formatı geçersiz");
        }

        var left = Number(b[0]);
        var top = Number(b[1]);
        var right = Number(b[2]);
        var bottom = Number(b[3]);

        if (isNaN(left) || isNaN(top) || isNaN(right) || isNaN(bottom)) {
            throw new Error(boundsKey + " sayısal değil");
        }

        return {
            widthPt: Math.abs(right - left),
            heightPt: Math.abs(top - bottom)
        };
    }

    function ptToMm(ptValue) {
        return (Number(ptValue) * 25.4) / 72.0;
    }

    function fmtMm(ptValue, decimals) {
        return ptToMm(ptValue).toFixed(decimals);
    }

    function getItemLabel(item, index) {
        var typeName = "UnknownItem";
        var name = "";

        try {
            if (item && item.typename) {
                typeName = item.typename;
            }
        } catch (ignoreType) {}

        try {
            if (item && item.name) {
                name = item.name;
            }
        } catch (ignoreName) {}

        if (name && name.length > 0) {
            return name + " [" + typeName + "]";
        }

        return "Item_" + (index + 1) + " [" + typeName + "]";
    }

    function normalizeError(err) {
        if (!err) {
            return "Bilinmeyen hata";
        }
        if (err.message) {
            return err.message;
        }
        return String(err);
    }
})();
