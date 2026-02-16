# Zemas Illustrator Plugin

Bu repo, Adobe Illustrator için geliştirilecek üretkenlik eklentisinin başlangıç tasarımını içerir.

## İlk hedef özellik

Birden fazla seçili objenin ölçülerini **tek tek** çıkarmak; ölçü hesaplamasında stroke'un (çizginin) dışarı taşıdığı gerçek görünür boyutu baz almak.

- Illustrator UI çoğu durumda nesnenin path/geometric ölçüsünü gösterir.
- Bizim ihtiyacımız, strokeli gerçek kutu ölçüsüdür.
- Bunun için Illustrator DOM tarafında `visibleBounds` baz alınacaktır.

Detaylar için: `docs/feature-multi-measure.md`


## Sonraki adım

JSX'ten kalıcı panel/eklentiye geçiş fikirleri: `docs/convert-to-plugin.md`
