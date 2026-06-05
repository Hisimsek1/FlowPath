# CLAUDE.md — FlowPath Proje Rehberi

Bu dosya Claude'un bağlam kaybettiğinde projeye nereden devam edeceğini bilmesi için yazılmıştır.
Her oturumda önce bu dosyayı oku, sonra README.md'yi oku.

---

## Projenin Durumu

> Bu bölümü her oturumda güncelle.

- [x] Klasör yapısı oluşturuldu (css/, js/, backend/, assets/maps/, assets/fonts/)
- [x] index.html iskeleti (tüm 6 bölüm, CDN'ler, navbar)
- [x] CSS temel yapısı + dark tema (siyah/beyaz, Space Grotesk + Bebas Neue)
- [x] Hero bölümü — Three.js wireframe TorusKnot, FLOWPATH yazısı, GSAP giriş animasyonu
- [x] Navbar — sabit, scroll'da backdrop blur alıyor
- [x] Scroll animasyonları — Lenis smooth scroll + GSAP ScrollTrigger kurulu
- [x] Sinematik intro bölümü — canvas animasyonu (şehir ışıkları → cyan grid dönüşümü, scroll-driven). Video gelince src değiştir.
- [x] Proje anlatım bölümü — 4 story block, tam ekran placeholder, sol/sağ alternating yazılar, scroll reveal, 01/04 numaralama
- [x] Algoritma seçim bölümü — interaktif THREE.js globe (meridyen+paralel çizgili küre), 28 dekoratif Fibonacci düğümü + bağlantı ağı, 4 algoritma düğümü (hover/tıklama/seçim), detay paneli, 2 seçim slot, devam butonu
- [x] Simülasyon (Canvas motoru + BFS, DFS, Dijkstra, A*) — TAMAMLANDI
- [x] İstatistikler (Chart.js — çarpışma + adım bar grafikleri, karşılaştırma tablosu) — TAMAMLANDI

- [x] Canva harita görselleri entegrasyonu — PNG parser hazır, assets/maps/'e koy yeter
- [x] Genel polish ve test — z-index fix, font tutarlılığı, section headers, winner highlight
- [x] Backend (Flask + Python algoritmalar) — backend/app.py + backend/algorithms/ hazır
- [x] Simülasyon: trail, pulsing hedef, yavaş (420ms), ağırlıklı grid (BFS≠Dijkstra)
- [x] Story bölümü: 200vh/block, progress dots, seamless crossfade, video bir kez oynar
- [x] Intro: scroll-driven FLOWPATH oluşumu, beyaz parçacıklar (hero ton uyumu)
- [x] Simülasyon kontrolleri: label/button görünürlüğü iyileştirildi
- [ ] Intro video entegrasyonu — videos/intro.mp4 gelince otomatik devreye girer

---

## Dosya Yapısı (Mevcut)

```
FLOWW PATHH/
├── index.html
├── CLAUDE.md           ← bu dosya
├── README.md
├── .env                ← FAL.AI API key
├── css/
│   └── style.css
├── js/
│   ├── main.js         ← Lenis + GSAP ScrollTrigger + story animasyonları
│   ├── hero.js         ← Three.js TorusKnot hero cismi
│   ├── intro.js        ← Scroll-driven sinematik intro canvas animasyonu
│   ├── algo-select.js  ← İnteraktif globe + algoritma seçimi
│   ├── algorithms.js   ← BFS, DFS, Dijkstra, A* (window.Algorithms objesi)
│   ├── simulation.js   ← Grid sınıfı, Agent sınıfı, Canvas renderer, çarpışma tespiti
│   └── stats.js        ← Chart.js grafikleri (window.renderCharts() ile tetiklenir)
├── backend/
│   └── algorithms/     ← BOŞ (Adım 9'da doldurulacak)
├── assets/
│   ├── maps/           ← BOŞ (Canva haritaları gelince)
│   └── fonts/
└── videos/
    └── örnekVideo.mp4  ← referans video (kullanılmıyor)
```

---

## Kullanıcı Hakkında

- Algoritmalar dersi öğrencisi
- Python'ı az çok biliyor, JavaScript/frontend'e daha az hakim
- Projeyi sınıfta canlı demo yapacak, anlatım yapacak
- Görsel etki çok önemli (hoca UI/UX istiyor)
- **Teslim: 1-2 gün içinde bitmeli**

---

## Kararlaştırılan Tasarım Detayları

### Genel
- Dark tema, koyu arka plan (siyah/lacivert), mavi/cyan accent, beyaz yazı
- Referans: gönderilen Canva tasarımındaki FLOWPATH görseli
- Font: Space Grotesk veya Inter (geometrik sans-serif)
- Dil: Türkçe, teknik terimler orijinal (A*, BFS, pathfinding)

### Hero Bölümü
- "FLOWPATH" yazısı yukarıdan yavaşça iner (scroll ile tetiklenir)
- Arkasında Three.js ile dönen 3D cisim var (Canva'daki referans görsele benzer)
- Scroll başlayınca hero elementi erir/kaybolur

### Scroll Animasyonları
- Lenis (smooth scroll) + GSAP ScrollTrigger kullanılacak
- Referans: örnekVideo.mp4 — "FIND Real Estate" sitesi tarzı
  - Hero → fullscreen zoom geçişi
  - Scroll-driven video (video frame frame ilerliyor)
  - Büyük tipografi reveal
- Apple tarzı: ekran sabit kalır, içerik arkadan gelir

### Proje Anlatım Bölümü (Bölüm 3)
- **Seçenek B**: Video tam ekran arka planda, yazılar kenarında yüzer (videoyu kapatmaz)
- 4 video, her biri loop, ses yok
- Video 1 (sağda yazı): Kalabalık yaya geçidi, kaos → "neden bu problem var"
- Video 2 (solda yazı): Oyun karakterleri kaotik hareket → "oyun dünyasında aynı sorun"
- Video 3 (sağda yazı): Düzenli trafik akışı → "algoritma devreye girince"
- Video 4 (solda yazı): Kod akan ekran → "biz ne yaptık"

**NOT:** Videolar henüz yok. Kullanıcı AI ile üretecek (image-to-video). Bekle veya placeholder koy.

### Algoritma Seçim Bölümü (Bölüm 4)
- Sol taraf: dikey liste — BFS, DFS, Dijkstra, A*
- Sağ taraf: hover'da algoritmanın açıklaması + Three.js animasyonu (hero'dakine benzer cisim)
- Geçiş: smooth, güzel bir CSS/GSAP transition
- Kullanıcı **2 algoritma** seçer, sonra devam eder

### Simülasyon Bölümü (Bölüm 5) — TAMAMLANDI
- 3 harita hardcoded (20×30 grid): Harita1=şehir ızgarası, Harita2=labirent, Harita3=açık alan
- Ajan sayısı: 5 / 15 / 25 / 35
- İki algoritma **yan yana** canvas'ta çalışır (aynı seed → aynı başlangıç/hedef noktaları)
- Hız: 120ms/adım (TICK_MS sabiti — değiştirilebilir)
- Çarpışma: kırmızı flash efekti (flashTimer=8 frame)
- Canvas sol üst: canlı adım/çarpışma/ulaşan sayacı
- Simülasyon bitince → istatistik bölümü otomatik açılır ve scroll eder
- `window.selectedAlgorithms` dizisini algo-select.js'ten alır
- `window._simStats` → `window.renderCharts()` zinciriyle stats.js'e veri aktarır
- Canva haritaları gelince: assets/maps/map1.png vb. yerleştir, map-option img otomatik gösterir

### İstatistik Bölümü (Bölüm 6) — TAMAMLANDI
- Simülasyon bitince otomatik açılır (display:none → block) + scrollIntoView
- Chart.js bar grafiği: çarpışma sayısı karşılaştırması (chart-collision)
- Chart.js bar grafiği: toplam adım karşılaştırması (chart-steps)
- Tablo: çarpışma, toplam adım, süre (ms), hedefe ulaşan ajan
- `window.renderCharts()` fonksiyonu stats.js'te — simulation.js çağırır

---

## Tech Stack (Kesinleşmiş)

| Katman | Teknoloji |
|--------|-----------|
| Scroll animasyonu | GSAP + ScrollTrigger + Lenis |
| 3D cisim | Three.js |
| Simülasyon | HTML5 Canvas (vanilla JS) |
| Grafikler | Chart.js |
| Backend | Python Flask |
| Algoritmalar | Python (backend) + JS (frontend canvas için) |
| Harita görselleri | Canva Pro → PNG |
| Videolar | Kullanıcı üretecek (AI image-to-video) |

---

## Backend Yapısı

Flask API, algoritma hesaplamalarını yapar ve JSON döner.

```
GET  /api/health
POST /api/simulate
  body: { algorithm: "astar", map: 1, agents: 25 }
  response: { steps: [...], collisions: 12, duration_ms: 340 }
```

Simülasyon adımları frontend'e gönderilir, Canvas üzerinde oynatılır.

---

## Algoritma Detayları

4 algoritma uygulanacak, hepsi 2D grid üzerinde çalışır:

- **BFS**: Queue tabanlı, ağırlıksız, optimal adım sayısı, ama çok ajanda çarpışır
- **DFS**: Stack tabanlı, optimal değil, kaotik yol, kontrast göstermek için
- **Dijkstra**: Priority queue, ağırlıklı grid, optimal
- **A\***: Dijkstra + heuristik (Manhattan distance), en akıllısı

Grid üzerinde engeller var (walls), ajanlar A noktasından B noktasına gidecek.
Çarpışma: aynı anda aynı hücrede 2+ ajan.

---

## Önemli Notlar

1. **Simülasyon hızı yavaş olmalı** — demo sırasında çarpışmalar gösterilecek
2. **Canva haritaları gelmeden önce** kod içinde placeholder grid kullan
3. **Videolar gelmeden önce** placeholder div + arka plan rengi koy
4. Backend **zorunlu değil** başlangıçta — algoritmalar önce JS'te yaz, sonra Python'a taşı
5. Three.js cismi hem hero'da hem algoritma seçiminde kullanılacak — aynı component
6. Kullanıcı demo sırasında anlatım yapacak → UI'daki yazılar yeterince büyük ve net olmalı

---

## Kodlama Sırası (Önerilen)

1. Klasör yapısı + index.html iskeleti
2. CSS: dark tema, font, temel layout
3. Hero bölümü (Three.js cisim + FLOWPATH animasyonu)
4. Lenis + GSAP ScrollTrigger entegrasyonu
5. Sinematik intro bölümü (scroll-driven video)
6. Proje anlatım bölümü (4 video placeholder)
7. Algoritma seçim bölümü (sol liste + sağ açıklama)
8. Simülasyon bölümü (Canvas motoru + algoritmalar)
9. İstatistik bölümü (Chart.js)
10. Flask backend (algoritmaları Python'a taşı)
11. Canva harita görselleri entegrasyonu
12. Videolar gelince entegre et
13. Genel polish ve test
