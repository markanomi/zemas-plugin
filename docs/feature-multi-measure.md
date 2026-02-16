# Özellik Tasarımı: Çoklu Seçimde Gerçek Ölçü (Stroke Dahil)

## Problem Tanımı

Illustrator'da obje boyutu gösterimi çoğu akışta path (geometric) ölçüsüne yakındır. Bu, stroke uygulanan işlerde gerçek baskı/görünür ölçüyü kaçırır.

Örnek:
- Path boyutu: `12 x 10 mm`
- Stroke: `1 mm` (center align)
- Gerçek görünür ölçü: yaklaşık `13 x 11 mm`

## Hedef

Kullanıcı birden fazla obje seçtiğinde:
1. Her objeyi ayrı satırda listeler.
2. Genişlik/Yükseklik değerini stroke dahil gerçek ölçü ile verir.
3. İsteğe bağlı geometric ölçüyü de ikinci kolon olarak gösterir.

## Illustrator'da Doğru Veri Kaynağı

- Stroke dahil görünür sınır için: `visibleBounds`
- Path sınırı için: `geometricBounds`

`visibleBounds` dizisi Illustrator'da genelde şu sıradadır:
`[left, top, right, bottom]`

Hesap:
- width = `right - left`
- height = `top - bottom`

## Kenar Durumları

1. **Stroke Alignment (Inside / Center / Outside):**
   - `visibleBounds` bunu otomatik olarak yansıtır.
2. **Live effects, Appearance, Expand edilmemiş yapılar:**
   - `visibleBounds` çoğunlukla doğru görünür kutuyu verir.
   - Bazı kompleks effect kombinasyonlarında tolerans sapması olabilir; "yaklaşık" etiketi eklenebilir.
3. **Clipping mask içi öğeler:**
   - Kullanıcıya iki mod verilmeli:
     - "Maskeye göre ölç" (clip bounds)
     - "Gerçek içerik ölç" (iç path'ler)
4. **Text objects:**
   - Point text ve area text farklı davranabilir.
   - İlk versiyonda görünür bounds ile gitmek yeterli.
5. **Locked/Hidden öğeler:**
   - Seçimde olamaz ama parent lock durumlarında hata yakalanmalı.

## UI Önerisi (MVP)

Panel satır yapısı:
- `#` (sıra)
- `Ad` (layer/item adı)
- `W x H (Visible)`
- `W x H (Geometric)` (opsiyonel)
- `Birim` seçimi (mm, pt, px)

Ek aksiyonlar:
- "CSV kopyala"
- "Tabloyu panoya kopyala"
- "Seçimi canlı dinle" (selection change event)

## Dönüşüm Formülleri

Illustrator iç birimi point (pt):
- `1 in = 72 pt`
- `1 mm = 72 / 25.4 pt`
- `mm = pt * 25.4 / 72`

Öneri:
- İçeride tüm hesap pt
- UI'da seçilen birime dönüştür
- Display precision: varsayılan 2 hane (ayar yapılabilir)

## Uygulama Planı

1. **Core ölçüm katmanı**
   - `getItemMeasurements(pageItem)`
   - visible/geometric alanları döndürür.
2. **Selection collector**
   - `app.activeDocument.selection` üzerinden güvenli parse.
3. **Formatter**
   - birim dönüşümü + yuvarlama.
4. **Panel**
   - tablo render + export aksiyonları.
5. **Doğrulama senaryoları**
   - Stroke yok / center / outside
   - Text / compound path / group

## Sonraki İleri Seviye Özellikler

- Toplam kapladığı alan (union bounds)
- Objeler arası mesafe ölçümü
- En/boy tolerans filtresi (örn. 50 mm'den küçükleri işaretle)
- Preset rapor şablonları
- JSON/CSV export + batch raporlama

## Bu repo için başlangıç prototipi

`src/extendscript/measure-selected.jsx`

Bu script, seçili objelerin visible & geometric boyutlarını stroke dahil karşılaştırmalı olarak alert penceresinde listeler.
