# Süsle: plan

Yılbaşı ağacını aç, linki paylaş; arkadaşların ağacına süs asıp mesaj bıraksın. Mesajlar 1 Ocak 00:00'a kadar kilitli kalır, sonra açılır. Ağaç kalıcıdır, yıllar sonra da anı olarak açılır.

Adres: `susle.miracdeprem.com` · Repo: `MrcDprm/susle` · Klasör: `javascript/09-susle`

## Takvim

Bugün 27 Kasım. İnsanların linki Aralık başında paylaşabilmesi için hedef **en geç 3 Aralık yayında**. Kapsam buna göre dar ve tam: aşağıdaki her madde yapılır, liste dışı bir şey eklenmez.

## Özellikler

1. **Ağaç aç:** Giriş yok. Ağaç adı, örneğin Miraç'ın ağacı, ve 3 ağaç görünümünden biri seçilir.
   - Açan kişiye iki link verilir: herkese gidecek **paylaşım linki** `/a/<id>` ve sadece kendisinin tutacağı **sahip linki** `/y/<gizli-anahtar>`.
   - Sahip linki açıldığında tarayıcıya HttpOnly bir çerez yazılır; aynı tarayıcıda bir daha gerekmez. Sayfa, sahip linkini saklaman gerektiğini açıkça söyler ve kopyalama düğmesi verir.
2. **Süs as:** Ziyaretçi giriş yapmaz. Ad, ister gizli; 12 süsten biri; en fazla 500 karakter mesaj; herkes okuyabilsin seçeneği. Cloudflare Turnstile ile bot kontrolü.
3. **Kilit:** Mesajlar 1 Ocak 2027 00:00 Türkiye saatinde açılır, yeni süs kabulü de aynı anda kapanır.
   - Açılıştan önce ağaçta süsler ve geri sayım görünür. Ziyaretçiler isimleri görür, gizli isimler Anonim yazar. Sahip de kimin yazdığını görür, mesajları göremez.
   - Kilit sunucudadır: tarih gelmeden API mesaj metnini hiç göndermez.
4. **Açılış:** Sahip bütün mesajları okur. Herkese açık işaretlenen mesajları ziyaretçiler de okur. Süse tıklayınca mesaj kartı açılır.
5. **Sahip paneli:** Mesajları siler, ağacı yeni süslere kapatır ya da açar, ağacın adını değiştirir.
6. **Paylaşım:** Link kopyala, WhatsApp, X. Linkin önizleme görseli ağacın adıyla sunucuda üretilir.
7. **Instagram hikayesi:** 1080×1920 hikaye görseli. Açılıştan önce ağaç, kaç süs asıldığı ve kısa bir davet yazar; açılıştan sonra dolu ağaç görünür. Telefonda Paylaş menüsü dosyayla açılır, oradan Instagram Hikaye seçilir; masaüstünde görsel indirilir. Link, hikayeye bağlantı çıkartmasıyla elle eklenir: Instagram bunu web sitelerine kendiliğinden yaptırmıyor, ekranda tek cümleyle söylenir.
8. **Çok sayfalı ağaç:** Bir sayfaya 24 süs; dolunca sonraki sayfa açılır.
9. **İki dil:** Türkçe varsayılan, İngilizce `/en`.
10. **Kalıcılık:** Ağaç silinmez. Açılıştan sonra okunur durumda kalır.

## Sonradan eklenenler, 27 Kasım

- Ağaç açılınca kapanmayan paylaşım penceresi: paylaş menüsü, WhatsApp, X, hikaye, sahip linki, hatırlatıcı. Sahip linki kaydedilmeden kapanmaz.
- Altı ağaç: çam, karlı çam, göknar, ladin, gümüş, beyaz; sarkık dal uçları, katlarda renk geçişi ve yan gölge.
- Canlı ağaç: 20 saniyede bir süs sayısına bakılır, yeni süs dalına iner.
- 1 Ocak hatırlatıcısı: alarmlı takvim dosyası ve Google Takvim linki. Web bildirimi yerine bu seçildi; Vercel'in ücretsiz zamanlanmış görevi dakikasında çalışmıyor, iPhone'da web bildirimi ana ekrana eklenmeyi gerektiriyor.
- Gece yarısı kutlaması.

## Teknoloji

| Parça | Seçim | Neden |
|---|---|---|
| Uygulama | Next.js + TypeScript | Portfolyodan bildiğin çatı. Paylaşılan linkin önizleme ve hikaye görselleri sunucuda `next/og` ile üretilir; bu, statik bir sayfayla yapılamaz. |
| Barındırma | Vercel Hobby | `miracdeprem.com` DNS'i zaten Vercel'de, alt alan adı tek satır. Kişisel, ticari olmayan proje Hobby kurallarına uyuyor. |
| Veritabanı | Neon Postgres + Drizzle | Ücretsiz katman. Drizzle'da sorgular parametreli, SQL injection yok. |
| Bot koruması | Cloudflare Turnstile | Ücretsiz, kullanıcıya bulmaca çözdürmez. |
| Doğrulama | Zod | Sunucuda her girdi şemadan geçer. |
| Test | Vitest | Kilit tarihi, doğrulama, istek sınırı ve yetki kuralları. |

**Neden Cloudflare Workers değil:** Ücretsiz planda istek başına 10 ms işlemci sınırı var, Norma'da Next sayfaları 34-53 ms ölçülmüştü. Ayrıca `miracdeprem.com` Cloudflare'de değil.

**Ücretsiz katman kontrolü:**
- Vercel Hobby: ayda 100 GB trafik, 1 milyon fonksiyon çağrısı. Bir ağaç sayfası birkaç yüz KB; 100 bin ziyaret bile sınırın altında.
- Neon Free: 0,5 GB. Bir mesaj yaklaşık 1 KB, yani yüz binlerce mesaj sığar. 5 dakika boşta kalınca uyur, ilk istek yaklaşık 1 saniye gecikir; kabul edilebilir.
- Turnstile: sınırsız ve ücretsiz.
- Aylık maliyet: 0.

## Veri modeli

- `trees`: `id` tahmin edilemez 10 karakter, `name`, `style`, `owner_key_hash` SHA-256, `accepting` bool, `created_at`
- `ornaments`: `id` UUID, `tree_id`, `author_name` boş olabilir, `ornament_type` 0-11, `body` 500 karakter, `is_public` bool, `slot` ağaçtaki yeri, `created_at`, `ip_hash`
- `rate_limits`: `key`, `window_start`, `count`

## Güvenlik

- Sahip anahtarı 32 bayt rastgele; veritabanında yalnızca SHA-256 özeti durur. Çerez HttpOnly, Secure, SameSite=Lax, `__Host-` önekli.
- Her sahip işleminde yetki sunucuda kontrol edilir.
- Kilit sunucuda: açılıştan önce sorgu `body` alanını hiç seçmez. Bunun testi, kural bilerek bozularak doğrulanır.
- İstek sınırı: IP özeti başına saatte 10 süs, günde 5 ağaç. IP düz metin tutulmaz, gizli bir tuzla özetlenir.
- Mesajlar React ile kaçışlanarak gösterilir, `innerHTML` yok. Sıkı CSP, nonce'lu.
- CORS açılmaz; API yalnızca kendi sitesinden çağrılır.
- Ayrıntılı hata kullanıcıya gösterilmez.

## Tasarım

Telefon önce düşünülür: ağaç sayfası tek ekranlık bir kış gecesi sahnesidir. Lacivert gökyüzü, yanıp sönen yıldızlar, ay, ara sıra kayan bir yıldız, ekran boyunca yağan kar. Altta karlı tepeler, ışığı yanan evler, bacadan tüten duman ve arada yürüyen bir kedi. Ağaçta yanıp sönen ampul dizileri, parlayan yıldız, hafifçe sallanan süsler; süs sayısı arttıkça ağacın altındaki hediyeler çoğalır. Ağaca dokununca ağaç sallanır, dallardan kar silkelenir.

Ses: müzik kutusu tınısında Jingle Bells, Web Audio ile kodda üretilir, ses dosyası yok. Tarayıcılar sesin kendiliğinden başlamasına izin vermediği için ilk dokunuşla başlar; üstte açma kapama düğmesi var, tercih tarayıcıda saklanır. Süse dokununca ve süs asılınca kısa çan sesi.

Yazı tipi tek aile, Rubik; Türkçe harfler diğer harflerle aynı tasarımda. Hareketi azaltma tercihi olanlarda bütün animasyonlar ve kar kapanır.

## Parçalar

1. İskelet: Next, Drizzle şeması, Neon bağlantısı, Vitest, CSP
2. Ağaç açma, sahip linki ve çerezi
3. Süs asma: doğrulama, Turnstile, istek sınırı
4. Kilit, açılış ve sahip paneli
5. Tasarım: keçe ağaç, 12 süs, hareket
6. Paylaşım, önizleme görseli, Instagram hikayesi, İngilizce
7. Son tarama, yayın, SEO, README, `v1.0.0`
