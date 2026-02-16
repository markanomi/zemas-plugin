# JSX'i Eklentiye Dönüştürme Fikirleri (Illustrator)

Senin pain-point'in net: **her seferinde script çalıştırmak yoruyor**.
Aşağıda pratikten kurumsala giden 3 yol var.

## Yol 1 — Hızlı Çözüm (Plugin değil, ama sürekli kullanım kolay)

Amaç: Script'e tek tık / kısayol ile erişmek.

1. `measure-selected.jsx` dosyasını Illustrator Scripts klasörüne koy.
2. Illustrator'da script'i Action içine kaydet.
3. Action'a F tuşu / kısayol ata.

Avantaj:
- En hızlı kurulum.
- Teknik paketleme yok.

Dezavantaj:
- Hâlâ script tetikleme mantığı var.
- Panel deneyimi yok.

## Yol 2 — Orta Seviye (ScriptUI Palette)

Amaç: Illustrator açıkken panel benzeri mini UI sürekli açık kalsın.

Ne sağlar?
- "Refresh" butonu
- Birim seçimi (mm/pt/px)
- "Etiketleri yaz", "Etiketleri temizle" gibi kontroller

Artı:
- JSX içinde kalırsın, mevcut kodu çok az refactor ile taşırsın.

Eksi:
- Modern CEP/UXP kadar esnek değil.

## Yol 3 — Gerçek Eklenti Deneyimi (CEP Panel)

Amaç: Illustrator içinde kalıcı dockable panel.

### Önerilen mimari

- **UI katmanı (HTML/CSS/JS)**
  - Panelde tablo, filtreler, export butonları.
- **Bridge katmanı (`CSInterface.evalScript`)**
  - Panel JS -> ExtendScript fonksiyon çağrısı.
- **Core ölçüm katmanı (JSX)**
  - Seçimden `visibleBounds` okuyup JSON dön.

### Neden senin kullanımına uygun?

- Script'i tekrar tekrar manuel çalıştırmak yok.
- Panel her zaman açık.
- Tek tuşla "güncelle" / opsiyonel otomatik yenileme (polling) yapılır.

## Önerilen Geliştirme Sırası

1. Mevcut JSX dosyasını "fonksiyon döndüren" yapıya çevir:
   - Örn: `measureSelectionAsJson(options)`
2. Alert yerine JSON string döndür.
3. CEP panel UI'da bu JSON'u parse edip tabloya bas.
4. "Label yaz/temizle" komutlarını ayrı JSX fonksiyonlarına böl.
5. Sonra paketleme + imzalama adımına geç.

## Teknik Notlar

- Illustrator ölçüde doğruluk için ana kaynak yine `visibleBounds` olmalı.
- İçeride pt hesapla, UI'da mm/px dönüştür.
- Çok obje seçiminde hata izolasyonu şart (tek obje patlayınca tüm akış bozulmasın).

## MVP Panel Özellik Seti (Öneri)

- Seçili obje listesi
- W x H (Visible)
- Opsiyonel W x H (Geometric)
- "Etiketleri Yaz"
- "Etiketleri Temizle"
- "CSV Kopyala"
- "Auto refresh" (500–1000ms polling)

## Sonuç

Sana en uygun yol: **Yol 3 (CEP panel)**.
Ama delivery hızını korumak için:
- bugün: mevcut JSX core'u fonksiyonlaştır,
- sonra: CEP panel bağla,
- en son: paketle/imzala.

Böylece "script'i sürekli çalıştır" derdi kalmaz.
