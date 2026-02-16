# Zemas Illustrator Plugin

Bu repo, Adobe Illustrator için geliştirilecek ölçü odaklı panel eklentisinin başlangıç tasarımını ve prototip kodunu içerir.

## İlk hedef özellik

Birden fazla seçili objenin ölçülerini **tek tek** çıkarmak; ölçü hesaplamasında stroke'un (çizginin) dışarı taşıdığı gerçek görünür boyutu baz almak.

- Illustrator UI çoğu durumda nesnenin path/geometric ölçüsünü gösterir.
- Bizim ihtiyacımız, strokeli gerçek kutu ölçüsüdür.
- Bunun için Illustrator DOM tarafında `visibleBounds` baz alınır.

Detaylar için: `docs/feature-multi-measure.md`

## Sürekli açık panel başlangıcı (CEP)

Bu repo artık CEP panel iskeleti içerir:

- `cep/CSXS/manifest.xml`
- `cep/index.html`
- `cep/js/panel.js`
- `cep/css/panel.css`
- `src/extendscript/measure-panel-api.jsx`

### Panelde mevcut MVP aksiyonları

- Seçimi ölç (visible + optional geometric)
- Birim seçimi (`mm`, `pt`, `px`)
- Hane sayısı
- Otomatik yenileme (1sn)
- Etiket yaz / etiket temizle
- CSV kopyala

## Sonraki adım

JSX'ten kalıcı panel/eklentiye geçiş fikirleri: `docs/convert-to-plugin.md`
