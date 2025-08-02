# Google Search Console Setup - Edirne Events

## 📋 Hızlı İndexleme Rehberi

### 1. Google Search Console Kurulum

#### Adım 1: Search Console'a Git
1. `https://search.google.com/search-console` adresine git
2. Google hesabınla giriş yap
3. "Özellik ekle" butonuna tıkla

#### Adım 2: Domain Doğrulama
**URL Öneki Yöntemi Seç:**
```
https://www.edirne-events.com
```

**Domain Doğrulama Seçenekleri:**
- **HTML dosyası** (önerilen)
- **HTML meta tag** (kolay)
- **Google Analytics** (varsa)

### 2. HTML Meta Tag Doğrulama (En Kolay)

Search Console size şu şekilde meta tag verecek:
```html
<meta name="google-site-verification" content="[VERIFICATION_CODE]" />
```

Bu tag'i `layout.tsx` dosyasına ekleyelim.

### 3. Sitemap Submit Etme

#### Sitemap URL'si:
```
https://www.edirne-events.com/sitemap.xml
```

**Search Console'da:**
1. Sol menüden "Sitemaps" tıkla
2. "Yeni sitemap ekle" butonuna tıkla  
3. `sitemap.xml` yaz
4. "Gönder" butonuna tıkla

### 4. Manuel İndexleme İsteği

#### URL Inspection Tool:
1. Search Console'da üst arama kutusuna URL yaz:
   ```
   https://www.edirne-events.com
   https://www.edirne-events.com/events
   https://www.edirne-events.com/venues
   ```
2. "Enter" tuşuna bas
3. "İndexleme isteği" butonuna tıkla
4. "İndexleme için test et" tıkla
5. "İndexleme için iste" butonuna tıkla

### 5. Öncelikli URL'ler

**İlk İndexlenecek Sayfalar:**
```
https://www.edirne-events.com/
https://www.edirne-events.com/events
https://www.edirne-events.com/venues
https://www.edirne-events.com/admin
```

**Kategori Sayfaları:**
```
https://www.edirne-events.com/events?category=konser
https://www.edirne-events.com/events?category=tiyatro
https://www.edirne-events.com/events?category=festival
```

### 6. Performance Takibi

**Search Console Metrikleri:**
- **Tıklamalar** (site ziyaretleri)
- **Gösterimler** (Google'da görünme)
- **CTR** (tıklama oranı)
- **Ortalama pozisyon** (sıralama)

**Hedef Metrikler (İlk Ay):**
- Gösterimler: 100+
- Tıklamalar: 10+
- Ortalama pozisyon: 20-50

## 🚀 Hızlandırma Taktikleri

### Social Signals (Sosyal Sinyaller)
**Facebook:**
- Sayfa oluştur: "Edirne Events"
- Website link'i ekle
- İlk 5 post paylaş

**Instagram:**
- @edirneevents hesabı
- Bio'da website linki
- Hashtag: #edirneevents #edirneetkinlik

**Twitter:**
- @edirneevents hesabı
- Website linki
- Günlük etkinlik tweet'leri

### Local Citations (Yerel Kayıtlar)
**Ücretsiz Kayıt Yerleri:**
- **Yandex Maps** (Türkiye'de önemli)
- **Foursquare/Swarm**
- **Facebook Places**
- **Bing Places**

### Content Marketing
**Blog İçeriği:**
- "Edirne'de Bu Hafta" haftalık yazılar
- "Selimiye Camii Çevresindeki Etkinlikler"
- "Sarayiçi Festival Alanı Rehberi"

### Link Building
**Kolay Backlink'ler:**
- **Edirne Belediyesi** (contact for partnership)
- **Trakya University** (student events)
- **Tourism blogs** (Edirne travel guides)
- **Local news sites** (press releases)

## ⏰ İndexleme Takvibi

### Hafta 1:
- Search Console kurulum
- Sitemap submit
- Ana sayfalar indexing isteği
- Social media profilleri

### Hafta 2:
- Category sayfaları indexing
- İlk backlink'ler
- Google My Business tamamlama
- Content creation başlangıç

### Hafta 3-4:
- Performance monitoring
- Keyword tracking
- User-generated content
- Local SEO optimizasyon

## 📊 Success Metrikleri

### 1 Ay Sonra:
- Google'da "site:edirne-events.com" = 20+ sayfa
- "Edirne etkinlik" araması = sayfa 3-5
- Organic traffic = 50+ ziyaretçi/ay

### 3 Ay Sonra:
- "Edirne etkinlik" = sayfa 1-2
- Organic traffic = 200+ ziyaretçi/ay
- 5+ anahtar kelime top 10'da

### 6 Ay Sonra:
- "Edirne etkinlik" = top 3
- Organic traffic = 500+ ziyaretçi/ay
- Brand search başlangıcı

Bu rehberi takip ederek 2-3 hafta içinde Google'da görünmeye başlayacaksınız!