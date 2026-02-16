#target illustrator

/**
 * Seçili objelerin ölçülerini stroke dahil (visibleBounds) raporlar
 * ve istenirse Type Tool ile sahneye ölçü etiketi yazar.
 *
 * Bounds sırası: [left, top, right, bottom]
 */
(function () {
    var DECIMALS = 2;
    var SHOW_GEOMETRIC = true;

    var CREATE_TEXT_LABELS = true;
    var CLEAR_PREVIOUS_LABELS = true;
    var LABEL_LAYER_NAME = "ZEMAS_MEASURE_LABELS";
    var LABEL_OFFSET_MM = 2;
    var LABEL_FONT_SIZE_PT = 10;

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

    var labelLayer = null;
    if (CREATE_TEXT_LABELS) {
        labelLayer = getOrCreateLayer(doc, LABEL_LAYER_NAME);
        if (CLEAR_PREVIOUS_LABELS) {
            removeManagedLabels(labelLayer);
        }
    }

    var lines = [];
    lines.push("Seçili Objeler Ölçü Raporu (Stroke Dahil)");
    lines.push("================================================");
    lines.push("Toplam seçili öğe: " + selection.length);
    lines.push("");

    var successCount = 0;
    var failCount = 0;
    var labelCount = 0;

    for (var i = 0; i < selection.length; i++) {
        var item = selection[i];

        try {
            var visible = getBoundsSizePt(item, "visibleBounds");
            var geometric = SHOW_GEOMETRIC ? getBoundsSizePt(item, "geometricBounds") : null;
            var visibleBounds = getBounds(item, "visibleBounds");

            var visibleText = fmtMm(visible.widthPt, DECIMALS) + " x " + fmtMm(visible.heightPt, DECIMALS) + " mm";

            var row = [];
            row.push((i + 1) + ") " + getItemLabel(item, i));
            row.push("   Visible : " + visibleText);

            if (SHOW_GEOMETRIC && geometric) {
                row.push("   Geometric: " + fmtMm(geometric.widthPt, DECIMALS) + " x " + fmtMm(geometric.heightPt, DECIMALS) + " mm");
                row.push("   Fark     : +" + fmtMm(visible.widthPt - geometric.widthPt, DECIMALS) + " x +" + fmtMm(visible.heightPt - geometric.heightPt, DECIMALS) + " mm");
            }

            if (CREATE_TEXT_LABELS) {
                createMeasureLabel(doc, labelLayer, visibleBounds, visibleText, LABEL_OFFSET_MM, LABEL_FONT_SIZE_PT);
                labelCount++;
                row.push("   Etiket   : Yazıldı");
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

    lines.push("Özet: Başarılı " + successCount + " | Hatalı " + failCount + " | Etiket " + labelCount);

    var report = lines.join("\n");
    alert(report);

    try {
        $.writeln(report);
    } catch (ignore) {}

    function getBounds(pageItem, boundsKey) {
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

        return [left, top, right, bottom];
    }

    function getBoundsSizePt(pageItem, boundsKey) {
        var b = getBounds(pageItem, boundsKey);

        return {
            widthPt: Math.abs(b[2] - b[0]),
            heightPt: Math.abs(b[1] - b[3])
        };
    }

    function createMeasureLabel(documentRef, layerRef, bounds, textValue, offsetMm, fontSizePt) {
        var left = bounds[0];
        var top = bounds[1];
        var offsetPt = mmToPt(offsetMm);

        var textFrame = layerRef.textFrames.add();
        textFrame.contents = textValue;
        textFrame.position = [left, top + offsetPt];
        textFrame.note = "zemas:measure-label";

        try {
            textFrame.textRange.characterAttributes.size = fontSizePt;
        } catch (ignoreSize) {}

        try {
            var color = new RGBColor();
            color.red = 255;
            color.green = 0;
            color.blue = 0;
            textFrame.textRange.characterAttributes.fillColor = color;
        } catch (ignoreColor) {}

        return textFrame;
    }

    function getOrCreateLayer(documentRef, layerName) {
        var layer = null;

        for (var i = 0; i < documentRef.layers.length; i++) {
            if (documentRef.layers[i].name === layerName) {
                layer = documentRef.layers[i];
                break;
            }
        }

        if (!layer) {
            layer = documentRef.layers.add();
            layer.name = layerName;
        }

        layer.visible = true;
        layer.locked = false;

        return layer;
    }

    function removeManagedLabels(layerRef) {
        for (var i = layerRef.textFrames.length - 1; i >= 0; i--) {
            try {
                if (layerRef.textFrames[i].note === "zemas:measure-label") {
                    layerRef.textFrames[i].remove();
                }
            } catch (ignore) {}
        }
    }

    function ptToMm(ptValue) {
        return (Number(ptValue) * 25.4) / 72.0;
    }

    function mmToPt(mmValue) {
        return (Number(mmValue) * 72.0) / 25.4;
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
