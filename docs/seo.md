# Süsle: SEO

Ana sayfa ve /en arama motorlarına açık. Ağaç sayfaları kişilerin adlarını ve mesajlarını taşıdığı için `noindex`; robots.txt de onları dışarıda bırakıyor.

## Anahtar kelimeler

### Türkçe

Genel:
- yılbaşı ağacı
- sanal yılbaşı ağacı
- online yılbaşı ağacı
- yılbaşı mesajı

Daha belirli:
- arkadaşların süslediği yılbaşı ağacı
- yılbaşı ağacına mesaj bırakma
- yılbaşında açılan mesajlar
- yeni yıl dilek ağacı
- yılbaşı ağacı linki paylaş
- instagram yılbaşı ağacı hikaye
- yılbaşı dilek mesajları arkadaşlara

### İngilizce

General:
- virtual christmas tree
- online new year tree
- new year message

More specific:
- christmas tree friends decorate
- leave a message on my christmas tree
- messages that open on new year
- new year wish tree
- share christmas tree link
- decorate my tree online

## Sayfalardaki yerleri

- `<title>` ve meta açıklama: `src/lib/i18n.ts` içindeki `meta`.
- Open Graph ve X kartı: ana sayfada `/api/og`, ağaçlarda `/api/og/<id>`.
- canonical ve hreflang: `src/app/[lang]/layout.tsx`.
- JSON-LD `WebApplication`: `src/app/[lang]/page.tsx`.
- `sitemap.xml` ve `robots.txt`: `src/app/sitemap.ts`, `src/app/robots.ts`.
- Sayfa başına tek `h1`.

## Search Console

1. https://search.google.com/search-console adresinde Mülk ekle, URL öneki: `https://susle.miracdeprem.com`.
2. Doğrulama için HTML etiketi ya da DNS kaydı; miracdeprem.com zaten alan adı mülkü olarak doğrulandıysa ayrıca gerekmez.
3. Site haritaları bölümüne `sitemap.xml` girilir.
4. URL denetimi ile ana sayfa ve /en için dizine ekleme istenir.
