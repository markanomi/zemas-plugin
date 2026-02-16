# CEP Panel Kurulum Notları

Bu klasör Illustrator için CEP panel başlangıç iskeletini içerir.

## Önemli

- `cep/js/CSInterface.js` dosyası bu repoda **stub** olarak tutulur.
- Gerçek kullanımda Adobe CEP SDK'daki resmi `CSInterface.js` ile değiştirin.

## Geliştirme akışı (özet)

1. `manifest.xml` içindeki bundle/id değerlerini sabitle.
2. Eklenti klasörünü CEP extensions dizinine kopyala.
3. Illustrator'da paneli aç: `Window > Extensions`.
4. Panel butonları `zemasMeasure.*` ExtendScript fonksiyonlarını çağırır.

## Host API

`src/extendscript/measure-panel-api.jsx` şunları sağlar:

- `zemasMeasure.getSelectionJson(optionsJson)`
- `zemasMeasure.writeLabels()`
- `zemasMeasure.clearLabels()`
