#target illustrator

var zemasMeasure = (function () {
    var LABEL_LAYER_NAME = "ZEMAS_MEASURE_LABELS";
    var LABEL_NOTE = "zemas:measure-label";
    var LABEL_OFFSET_MM = 2;
    var LABEL_FONT_SIZE_PT = 10;

    function getSelectionJson(optionsJson) {
        try {
            var options = parseOptions(optionsJson);
            if (app.documents.length === 0) {
                return stringify({ error: "Açık doküman yok." });
            }

            var doc = app.activeDocument;
            var selection = doc.selection;
            if (!selection || selection.length === 0) {
                return stringify({ rows: [], showGeometric: options.showGeometric });
            }

            var rows = [];
            for (var i = 0; i < selection.length; i++) {
                var item = selection[i];
                try {
                    var visible = getBoundsSizePt(item, "visibleBounds");
                    var geometric = getBoundsSizePt(item, "geometricBounds");

                    rows.push({
                        label: getItemLabel(item, i),
                        visibleText: formatSize(visible.widthPt, visible.heightPt, options.unit, options.decimals),
                        geometricText: formatSize(geometric.widthPt, geometric.heightPt, options.unit, options.decimals)
                    });
                } catch (err) {
                    rows.push({
                        label: getItemLabel(item, i),
                        visibleText: "Hata",
                        geometricText: normalizeError(err)
                    });
                }
            }

            return stringify({ rows: rows, showGeometric: options.showGeometric });
        } catch (fatal) {
            return stringify({ error: normalizeError(fatal) });
        }
    }

    function writeLabels() {
        if (app.documents.length === 0) {
            return "Açık doküman yok.";
        }

        var doc = app.activeDocument;
        var selection = doc.selection;
        if (!selection || selection.length === 0) {
            return "Seçim yok.";
        }

        var layer = getOrCreateLayer(doc, LABEL_LAYER_NAME);
        removeManagedLabels(layer);

        var count = 0;
        for (var i = 0; i < selection.length; i++) {
            var item = selection[i];
            try {
                var visible = getBoundsSizePt(item, "visibleBounds");
                var b = getBounds(item, "visibleBounds");
                var textValue = formatSize(visible.widthPt, visible.heightPt, "mm", 2);
                createMeasureLabel(layer, b, textValue, LABEL_OFFSET_MM, LABEL_FONT_SIZE_PT);
                count++;
            } catch (ignore) {}
        }

        return "Etiket yazıldı: " + count;
    }

    function clearLabels() {
        if (app.documents.length === 0) {
            return "Açık doküman yok.";
        }

        var doc = app.activeDocument;
        var layer = getOrCreateLayer(doc, LABEL_LAYER_NAME);
        var before = layer.textFrames.length;
        removeManagedLabels(layer);
        var removed = before - layer.textFrames.length;
        return "Etiket temizlendi: " + removed;
    }

    function parseOptions(optionsJson) {
        var defaults = { unit: "mm", decimals: 2, showGeometric: true };
        if (!optionsJson || !optionsJson.length) {
            return defaults;
        }

        try {
            var parsed = JSON.parse(optionsJson);
            if (parsed.unit === "mm" || parsed.unit === "pt" || parsed.unit === "px") {
                defaults.unit = parsed.unit;
            }
            if (!isNaN(parsed.decimals)) {
                defaults.decimals = Math.min(4, Math.max(0, Number(parsed.decimals)));
            }
            defaults.showGeometric = parsed.showGeometric !== false;
        } catch (ignore) {}

        return defaults;
    }

    function getBounds(pageItem, boundsKey) {
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

    function createMeasureLabel(layerRef, bounds, textValue, offsetMm, fontSizePt) {
        var textFrame = layerRef.textFrames.add();
        textFrame.contents = textValue;
        textFrame.position = [bounds[0], bounds[1] + mmToPt(offsetMm)];
        textFrame.note = LABEL_NOTE;

        try {
            textFrame.textRange.characterAttributes.size = fontSizePt;
            var color = new RGBColor();
            color.red = 255;
            color.green = 0;
            color.blue = 0;
            textFrame.textRange.characterAttributes.fillColor = color;
        } catch (ignore) {}
    }

    function getOrCreateLayer(documentRef, layerName) {
        for (var i = 0; i < documentRef.layers.length; i++) {
            if (documentRef.layers[i].name === layerName) {
                documentRef.layers[i].locked = false;
                documentRef.layers[i].visible = true;
                return documentRef.layers[i];
            }
        }

        var layer = documentRef.layers.add();
        layer.name = layerName;
        layer.locked = false;
        layer.visible = true;
        return layer;
    }

    function removeManagedLabels(layerRef) {
        for (var i = layerRef.textFrames.length - 1; i >= 0; i--) {
            try {
                if (layerRef.textFrames[i].note === LABEL_NOTE) {
                    layerRef.textFrames[i].remove();
                }
            } catch (ignore) {}
        }
    }

    function formatSize(widthPt, heightPt, unit, decimals) {
        return formatUnit(widthPt, unit, decimals) + " x " + formatUnit(heightPt, unit, decimals) + " " + unit;
    }

    function formatUnit(valuePt, unit, decimals) {
        if (unit === "pt") {
            return Number(valuePt).toFixed(decimals);
        }
        if (unit === "px") {
            return (Number(valuePt) / 0.75).toFixed(decimals);
        }
        return ptToMm(valuePt).toFixed(decimals);
    }

    function ptToMm(ptValue) {
        return (Number(ptValue) * 25.4) / 72.0;
    }

    function mmToPt(mmValue) {
        return (Number(mmValue) * 72.0) / 25.4;
    }

    function getItemLabel(item, index) {
        var name = "";
        var typeName = "UnknownItem";

        try {
            if (item.name) {
                name = item.name;
            }
            if (item.typename) {
                typeName = item.typename;
            }
        } catch (ignore) {}

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

    function stringify(value) {
        if (typeof JSON !== "undefined" && JSON.stringify) {
            return JSON.stringify(value);
        }
        return "{\"error\":\"JSON.stringify yok\"}";
    }

    return {
        getSelectionJson: getSelectionJson,
        writeLabels: writeLabels,
        clearLabels: clearLabels
    };
})();
