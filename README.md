# FlowPath — Ajan Tabanlı Yol Bulma Simülasyon Platformu

> Algoritmalar Dersi Dönem Projesi — Çoklu ajan ortamında BFS, DFS, Dijkstra ve A\* algoritmalarının gerçek zamanlı karşılaştırmalı görselleştirmesi.

---

## Proje Hakkında

**FlowPath**, farklı pathfinding algoritmalarının çok ajanlı bir ortamda nasıl davrandığını interaktif biçimde karşılaştıran bir web simülasyon platformudur.

Temel iddia: Az ajanda tüm algoritmalar benzer performans gösterir. Ajan sayısı arttıkça (25–55) BFS ve DFS gibi basit algoritmalar çarpışmalarda belirgin artış yaşarken, Dijkstra ve A\* çarpışmayı en aza indirir.

Kullanıcı akışı:

```
Algoritma Seç (2 tane)  →  Harita + Ajan Sayısı Seç  →  Simülasyonu Başlat  →  İstatistikleri Karşılaştır
```

---

## Özellikler

- **Sinematik giriş** — Scroll ile tetiklenen GSAP animasyonları ve Three.js dönen 3D cisim
- **İnteraktif 3D globe** — Fibonacci dizisiyle yerleştirilmiş algoritma düğümleri, OrbitControls
- **Gerçek zamanlı Canvas simülasyonu** — İki algoritma yan yana, aynı seed ile aynı başlangıç/hedef
- **Ağırlıklı grid** — Dijkstra ve A\*'ın "pahalı" bölgelerden kaçtığını gösteren weight zone sistemi
- **Görsel çarpışma tespiti** — Kırmızı flash efekti, canlı HUD sayaçları
- **İstatistik paneli** — Chart.js bar grafikleri, donut grafikleri, kazanan banner
- **Flask backend** — Python'da hesaplanan yollar JSON olarak frontend'e gönderilir

---

## Algoritmalar

| Algoritma | Tür        | Karmaşıklık       | Optimal | Ağırlıklı | Çok Ajanda Çarpışma |
|-----------|------------|-------------------|---------|-----------|---------------------|
| BFS       | Uninformed | O(V + E)          | Evet    | Hayır     | Yüksek              |
| DFS       | Uninformed | O(V + E)          | Hayır   | Hayır     | Çok Yüksek          |
| Dijkstra  | Informed   | O((V+E) log V)    | Evet    | Evet      | Düşük               |
| A\*       | Informed   | O((V+E) log V)    | Evet    | Evet      | Çok Düşük           |

---

## Teknoloji Yığını

**Frontend**

| Kütüphane | Sürüm | Kullanım |
|-----------|-------|----------|
| GSAP + ScrollTrigger | 3.12.5 | Scroll animasyonları, hero reveal |
| Lenis | 1.1.14 | Smooth scroll |
| Three.js | r128 | 3D hero cismi + algoritma globe |
| Chart.js | 4.4.4 | Bar ve donut grafikleri |
| HTML5 Canvas | — | Simülasyon render motoru |

**Backend**

| Teknoloji | Kullanım |
|-----------|----------|
| Python 3.x | Algoritma hesaplamaları |
| Flask | REST API |
| flask-cors | Cross-origin izni |

---

## Kurulum

### Backend

```bash
cd backend
pip install flask flask-cors
python app.py
# → http://localhost:5000
```

### Frontend

```bash
# Doğrudan açmak için (Live Server önerilir):
# VS Code → Live Server uzantısı → index.html'e sağ tıkla → Open with Live Server

# Veya Python ile basit HTTP sunucu:
python -m http.server 8080
# → http://localhost:8080
```

> **Not:** Backend çalışmıyorsa simülasyon JavaScript motoru ile yedek modda devam eder.

---

## API Referansı

### `GET /api/health`

```json
{ "status": "ok", "message": "FlowPath Backend çalışıyor" }
```

### `GET /api/algorithms`

Tüm algoritmaların meta bilgisini döner (isim, karmaşıklık, açıklama).

### `POST /api/simulate`

```json
// İstek
{
  "algorithm": "astar",
  "map": 0,
  "agents": 25,
  "seed": 42
}

// Yanıt
{
  "algorithm": "astar",
  "map": 0,
  "agents": 25,
  "paths": [ [[r,c], ...], ... ],
  "collisions": 3,
  "total_steps": 842,
  "duration_ms": 12.4,
  "arrived": 25
}
```

**Parametreler:**

| Alan | Tip | Değerler |
|------|-----|----------|
| `algorithm` | string | `bfs`, `dfs`, `dijkstra`, `astar` |
| `map` | int | `0` (şehir), `1` (labirent), `2` (açık alan) |
| `agents` | int | 1 – 55 |
| `seed` | int | Herhangi bir tam sayı (deterministik tekrar için) |

---

## Klasör Yapısı

```
FLOWW PATHH/
├── index.html               # Tek sayfa uygulama, 6 bölüm
├── css/
│   └── style.css            # Dark tema, CSS değişkenleri, tüm component stilleri
├── js/
│   ├── main.js              # Lenis + GSAP ScrollTrigger + story animasyonları
│   ├── hero.js              # Three.js TorusKnot hero cismi
│   ├── intro.js             # Scroll-driven sinematik canvas animasyonu
│   ├── algo-select.js       # Three.js globe + algoritma seçim UI
│   ├── algorithms.js        # BFS, DFS, Dijkstra, A* (vanilla JS, canvas için)
│   ├── simulation.js        # Grid, Agent sınıfları + Canvas render motoru
│   └── stats.js             # Chart.js grafikleri (window.renderCharts() ile tetiklenir)
├── backend/
│   ├── app.py               # Flask API + harita tanımları + weight zone sistemi
│   └── algorithms/
│       ├── __init__.py
│       ├── bfs.py
│       ├── dfs.py
│       ├── dijkstra.py
│       └── astar.py
├── assets/
│   ├── maps/                # map1.png, map2.png, map3.png → otomatik parse edilir
│   └── fonts/
├── images/
│   ├── BFS.png              # Algoritma paneli görselleri
│   ├── DFS.png
│   ├── Dijkstra.png
│   └── AStar.png
└── videos/
    └── intro.mp4            # Scroll-driven sinematik video (opsiyonel)
```

---

## Harita Sistemi

3 hardcoded 20×30 grid harita bulunmakta, `assets/maps/` klasörüne PNG bırakıldığında otomatik override edilir:

| Harita | Özellik | Algoritma Farkı |
|--------|---------|-----------------|
| Harita 0 — Şehir Izgarası | Blok koridorlar, dar geçişler | Çarpışma en yüksek burada |
| Harita 1 — Labirent | Tek-yol kanallar | DFS bu haritada en kötü |
| Harita 2 — Açık Alan | Seyreltik engeller | Tüm algoritmalar benzer |

**PNG → Grid dönüşümü:** Piksel parlaklığı `< 110` → duvar (1), diğer → yol (0).

---

## Ağırlık Zonu Sistemi

Dijkstra ve A\*'ın BFS'den neden farklı yol seçtiğini göstermek için belirli hücre gruplarına yüksek geçiş maliyeti atanmıştır:

| Zone | Satır | Sütun | Ağırlık |
|------|-------|-------|---------|
| Merkez bölge | 5–14 | 10–20 | 3 |
| Sol üst | 3–8 | 3–8 | 2 |
| Sağ alt | 12–17 | 20–27 | 2 |

BFS bu ağırlıkları görmez, Dijkstra/A\* bu bölgelerden kaçar → farklı rotalar.

---

## Simülasyon Parametreleri

| Sabit | Değer | Açıklama |
|-------|-------|----------|
| `TICK_MS` | 420 ms | Adım başına bekleme süresi |
| `TRAIL_LEN` | 8 | Ajan iz uzunluğu |
| `FLASH_DURATION` | 8 tick | Çarpışma kırmızı flash süresi |
| `ROWS × COLS` | 20 × 30 | Grid boyutu |
| Maks ajan | 55 | Backend + frontend sınırı |

---

## Ekran Görüntüleri

> Simülasyon çalışırken screenshot almak için: Bölüm 4 → algoritma seç → Bölüm 5 → harita + ajan sayısı seç → Başlat.

---

## Ekip & Görev Dağılımı

<table>
  <tr>
    <td align="center" width="33%">
      <img src="https://ui-avatars.com/api/?name=Halil+Ibrahim+Simsek&size=100&background=00d4ff&color=000&bold=true&rounded=true" width="80" /><br/>
      <strong>Halil İbrahim Şimşek</strong><br/>
      <img src="https://img.shields.io/badge/Backend-%2300d4ff?style=flat-square" />
      <img src="https://img.shields.io/badge/Simülasyon-%2300d4ff?style=flat-square" /><br/>
      <sub>Simülasyon motoru · JS & Python algoritmalar · Flask API · Canlı demo</sub>
    </td>
    <td align="center" width="33%">
      <img src="https://ui-avatars.com/api/?name=Batuhan+Okyay&size=100&background=ffffff&color=000&bold=true&rounded=true" width="80" /><br/>
      <strong>Batuhan Okyay</strong><br/>
      <img src="https://img.shields.io/badge/Frontend-%23888888?style=flat-square" />
      <img src="https://img.shields.io/badge/Teknik%20Rapor-%23888888?style=flat-square" /><br/>
      <sub>Hero · Intro · Story animasyonları · Teknik raporun yazımı</sub>
    </td>
    <td align="center" width="33%">
      <img src="https://ui-avatars.com/api/?name=Betul+Dut&size=100&background=ffffff&color=000&bold=true&rounded=true" width="80" /><br/>
      <strong>Betül Dut</strong><br/>
      <img src="https://img.shields.io/badge/Frontend-%23888888?style=flat-square" />
      <img src="https://img.shields.io/badge/Sunum-%23888888?style=flat-square" /><br/>
      <sub>Globe · CSS tasarım sistemi · İstatistik UI · Sunum slaytları</sub>
    </td>
  </tr>
</table>

---

## Lisans

MIT

---

## Katkı

Bu proje bir ders ödevi olup katkı kabul etmemektedir. Referans/ilham için serbestçe kullanılabilir.
