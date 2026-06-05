# FlowPath

**Algoritmalar Dersi Proje Başlığı:** Oyun Motoru Yol Bulma ve Mekânsal Zeka Sistemi  
**Açıklama:** Strateji oyunlarında veya 3D ortamlarda binlerce karakterin birbirine çarpmadan hedefe ulaşması

---

## Proje Nedir?

FlowPath, farklı pathfinding algoritmalarının çoklu ajan ortamında nasıl davrandığını görselleştiren interaktif bir web simülasyonudur. Kullanıcı iki algoritma seçer, ajan sayısını belirler, harita seçer ve simülasyonu başlatır. Sonuçlar istatistiksel olarak karşılaştırılır: çarpışma sayısı, adım sayısı, tamamlanma süresi.

Temel iddia: Az ajanda hiçbir algoritma fark yaratmaz. Ajan sayısı arttıkça (25-35) BFS gibi basit algoritmalar çarpışmaya başlar, A* gibi akıllı algoritmalar bunu önler.

---

## Özellikler

- Sinematik scroll-driven giriş animasyonu (Apple tarzı)
- FLOWPATH hero animasyonu (Three.js dönen 3D cisim)
- 4 algoritma: **BFS**, **DFS**, **Dijkstra**, **A\***
- Ajan sayısı seçimi: 5 / 15 / 25 / 35
- 3 farklı grid haritası (farklı engel düzenleri)
- Gerçek zamanlı Canvas simülasyonu
- Simülasyon sonrası istatistik paneli (grafik + tablo)

---

## Algoritmalar

| Algoritma | Tür | Özellik |
|-----------|-----|---------|
| BFS | Uninformed | En kısa yol (adım sayısı), çok ajanda çarpışır |
| DFS | Uninformed | Optimal değil, kaotik yol, karşılaştırma için |
| Dijkstra | Informed | Ağırlıklı grid, optimal yol |
| A* | Informed | Heuristik, oyun motorlarının standardı |

---

## Tech Stack

**Frontend**
- HTML5, CSS3, Vanilla JavaScript
- [GSAP](https://gsap.com/) + ScrollTrigger — scroll animasyonları
- [Lenis](https://lenis.darkroom.engineering/) — smooth scroll
- [Three.js](https://threejs.org/) — 3D dönen cisim (hero + algoritma seçim bölümü)
- HTML5 Canvas — simülasyon
- [Chart.js](https://www.chartjs.org/) — istatistik grafikleri

**Backend**
- Python 3.x
- Flask — REST API
- Algoritma hesaplamaları Python'da çalışır, sonuçlar JSON olarak frontend'e gönderilir

---

## Site Yapısı

```
Bölüm 1 — Hero
  FLOWPATH yazısı yukarıdan iner, arkasında Three.js dönen cisim.
  Scroll başlayınca erir ve kaybolur.

Bölüm 2 — Sinematik Intro
  Ekran sabit, scroll ilerledikçe video frame frame oynar.
  Gece şehri → grid dönüşümü. GSAP ScrollTrigger ile.

Bölüm 3 — Proje Anlatımı
  Tam ekran video (background), kenarında yüzen yazılar (Apple tarzı).
  4 video, her biri farklı bir konsepti anlatır:
    - Neden bu problem var? (kalabalık kaos)
    - Oyun dünyasında aynı problem
    - Algoritma devreye girince (düzen)
    - Biz ne yaptık (kod/teknik his)

Bölüm 4 — Algoritma Seçimi
  Sol: BFS, DFS, Dijkstra, A* listesi (dikey)
  Sağ: Hover'da algoritma açıklaması + Three.js animasyon
  Kullanıcı 2 algoritma seçer.

Bölüm 5 — Simülasyon
  Harita seçimi (Canva'dan tasarlanmış 3 grid haritası)
  Ajan sayısı: 5 / 15 / 25 / 35
  Başlat butonu → Canvas simülasyonu

Bölüm 6 — İstatistikler
  Simülasyon bitince açılır.
  Chart.js bar/line grafikleri + karşılaştırma tablosu.
  Metrikler: çarpışma sayısı, adım sayısı, süre (ms)
```

---

## Tasarım

- **Tema:** Dark (koyu arka plan, açık yazı)
- **Renkler:** Siyah/lacivert arka plan, mavi/cyan accent, beyaz yazı
- **Font:** Geometrik sans-serif (Space Grotesk veya Inter)
- **Dil:** Türkçe arayüz, teknik terimler orijinal (A*, BFS, pathfinding vs.)
- Harita görselleri Canva Pro ile tasarlanır

---

## Kurulum

```bash
# Backend
cd backend
pip install flask flask-cors
python app.py

# Frontend
# Direkt index.html'i tarayıcıda aç veya Live Server kullan
```

---

## Klasör Yapısı (Planlanan)

```
FLOWW PATHH/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js          # GSAP, Lenis, scroll animasyonları
│   ├── hero.js          # Three.js hero cismi
│   ├── simulation.js    # Canvas simülasyon motoru
│   ├── algorithms.js    # BFS, DFS, Dijkstra, A* (JS tarafı)
│   └── stats.js         # Chart.js istatistikler
├── backend/
│   ├── app.py           # Flask API
│   └── algorithms/
│       ├── bfs.py
│       ├── dfs.py
│       ├── dijkstra.py
│       └── astar.py
├── assets/
│   ├── maps/            # Canva harita görselleri (PNG)
│   └── fonts/
├── videos/
│   ├── intro.mp4        # Şehir → grid dönüşümü
│   ├── video1.mp4       # Kaos sahnesi
│   ├── video2.mp4       # Oyun dünyası
│   ├── video3.mp4       # Düzenli akış
│   └── video4.mp4       # Kod/teknik his
└── .env
```
