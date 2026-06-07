# FlowPath — Teknik Rapor

**Proje Adı:** FlowPath — Ajan Tabanlı Yol Bulma Simülasyon Platformu
**Konu:** Çoklu Ajan Ortamında BFS, DFS, Dijkstra ve A\* Algoritmalarının Karşılaştırmalı Analizi
**Platform:** Web Uygulaması (Single Page Application)

---

## 1. Giriş ve Motivasyon

Bu proje, klasik yol bulma (pathfinding) algoritmalarının **çoklu ajan** senaryolarında nasıl farklılaştığını görsel ve istatistiksel olarak ortaya koymak amacıyla geliştirilmiştir.

Tek ajan için tüm optimal algoritmalar benzer sonuç üretir. Ancak **25–55 ajan** aynı grid üzerinde eş zamanlı hareket ettiğinde ortaya şu soru çıkar:

> *Hangi algoritma, en kalabalık ortamda en az çarpışmayla tüm ajanları hedefe ulaştırır?*

Bu soruyu yanıtlamak için FlowPath, iki algoritmayı aynı anda, aynı harita üzerinde, aynı başlangıç-hedef çiftleriyle çalıştırır ve sonuçları çarpışma sayısı, toplam adım ve süre üzerinden karşılaştırır.

---

## 2. Sistem Mimarisi

### 2.1 Genel Yapı

```
┌─────────────────────────────────────────┐
│              FRONTEND                   │
│                                         │
│  algo-select.js  →  simulation.js       │
│       ↓                  ↓              │
│   Three.js          HTML5 Canvas        │
│   Globe UI          Render Motoru       │
│                          ↓              │
│                     stats.js            │
│                     Chart.js Grafikleri │
└──────────────┬──────────────────────────┘
               │ POST /api/simulate (JSON)
┌──────────────▼──────────────────────────┐
│              BACKEND                    │
│                                         │
│  Flask app.py                           │
│  ├── /api/health                        │
│  ├── /api/algorithms                    │
│  └── /api/simulate                      │
│       ↓                                 │
│  algorithms/                            │
│  ├── bfs.py    ├── dfs.py               │
│  ├── dijkstra.py  └── astar.py          │
└─────────────────────────────────────────┘
```

### 2.2 Veri Akışı

1. Kullanıcı 2 algoritma seçer → `window.selectedAlgorithms = ["bfs", "astar"]`
2. Harita ve ajan sayısı seçilir
3. `startBtn` tıklandığında `fetchPaths()` iki ayrı POST isteği gönderir (paralel)
4. Backend her istek için `seed=42` ile deterministik başlangıç/hedef üretir
5. JSON yanıtındaki `paths` dizisi `simulation.js`'e verilir
6. Canvas her `TICK_MS=420ms`'de bir adım ilerletir
7. Simülasyon bitince `window._simStats` doldurulur, `window.renderCharts()` çağrılır

### 2.3 Yedek Mod

Flask sunucusu erişilemezse (`fetch` hata dönerse), `simulation.js` içindeki vanilla JS motoruna düşer. Bu motor aynı algoritmaları tarayıcı içinde çalıştırır; backend gerektirmez.

---

## 3. Veri Yapıları

### 3.1 Grid

20×30'luk iki boyutlu tam sayı matrisi:

```
0 → yol (geçilebilir)
1 → duvar (geçilemez)
```

Tüm kenar hücreler `1`'dir — ajanlar grid dışına çıkamaz. Üç harita hardcoded olarak tanımlanmıştır; `assets/maps/mapN.png` bulunursa PNG parser override eder.

**PNG → Grid dönüşümü:**

```javascript
const brightness = r*0.299 + g*0.587 + b*0.114;  // ITU-R BT.601
cell = (brightness < 110) ? 1 : 0;                // koyu → duvar
```

### 3.2 Ağırlık Haritası (Weight Map)

Belirli hücre gruplarına geçiş maliyeti atanmıştır:

```python
WEIGHT_ZONES = [
    (5, 14, 10, 20, 3),   # Satır 5–14, Sütun 10–20, Maliyet 3
    (3,  8,  3,  8, 2),   # Satır 3–8,  Sütun 3–8,   Maliyet 2
    (12, 17, 20, 27, 2),  # Satır 12–17, Sütun 20–27, Maliyet 2
]
```

BFS ve DFS bu tabloyu okumaz, her hücreyi maliyet=1 kabul eder.
Dijkstra ve A\* `weight` değerini priority queue hesabına katar → pahalı bölgelerden kaçar.

### 3.3 Agent Sınıfı

```javascript
class Agent {
  id          // benzersiz ajan kimliği (renk indeksi için de kullanılır)
  pos         // [row, col] — mevcut konum
  end         // [row, col] — hedef konum
  color       // CSS renk string'i (20 farklı renk paleti)
  path        // [[r,c], ...] — önceden hesaplanmış yol dizisi
  step        // path içindeki mevcut indeks
  arrived     // boolean — hedefe ulaştı mı?
  flashTimer  // > 0 ise çarpışma rengi göster (8 tick azalır)
  totalSteps  // toplam kat edilen adım sayısı
  trail       // son 8 konumun listesi (iz çizimi için)
}
```

### 3.4 Simülasyon İstatistik Objesi

```javascript
window._simStats = {
  algoA, algoB,          // algoritma isimleri
  collisionA, collisionB, // toplam çarpışma sayıları
  stepsA, stepsB,         // toplam adım sayıları
  timeA, timeB,           // backend hesaplama süresi (ms)
  arrivedA, arrivedB,     // hedefe ulaşan ajan sayısı
  agentCount,             // toplam ajan sayısı
  mapIndex                // seçilen harita
}
```

---

## 4. Algoritma Implementasyonları

### 4.1 BFS (Breadth-First Search)

**Dosya:** `js/algorithms.js`, `backend/algorithms/bfs.py`

```
Veri yapısı: FIFO Queue (deque)
Yön sırası: [Sağ, Aşağı, Sol, Yukarı] — sabit
Karmaşıklık: O(V + E)
Optimallik: Evet (ağırlıksız grid'de adım sayısı olarak)
```

Sabit yön sırası kasıtlıdır: tüm ajanlar aynı deterministik yolu tercih eder → dar koridorlarda maksimum çarpışma. Bu BFS'in "kalabalıkta kötü" özelliğini görsel olarak kanıtlar.

```python
def bfs(grid, start, end):
    queue = deque([start])
    visited = {start}
    prev = {}
    while queue:
        cur = queue.popleft()
        if cur == end:
            return reconstruct(prev, start, end)
        for nb in neighbors(grid, cur, DIRS=[E, S, W, N]):
            if nb not in visited:
                visited.add(nb)
                prev[nb] = cur
                queue.append(nb)
    return None
```

### 4.2 DFS (Depth-First Search)

**Dosya:** `js/algorithms.js`, `backend/algorithms/dfs.py`

```
Veri yapısı: LIFO Stack
Yön sırası: [Yukarı, Sol, Aşağı, Sağ] — ters sıra (kasıtlı kaotik yol)
Karmaşıklık: O(V + E)
Optimallik: Hayır
```

DFS kasıtlı olarak en uzun ve en kaotik yolu üretecek şekilde yapılandırılmıştır. Bu, diğer algoritmaların performansını kontrast için daha belirgin kılar. Simülasyonda DFS ajanları sık sık boş alanlarda "dolanır", hedefe en son ulaşır.

### 4.3 Dijkstra

**Dosya:** `js/algorithms.js`, `backend/algorithms/dijkstra.py`

```
Veri yapısı: Min-Heap (Priority Queue)
Karmaşıklık: O((V + E) log V)
Optimallik: Evet (toplam maliyet olarak)
Ağırlık: Evet
```

`dist[node]` dizisi tutulur, her adımda en düşük `dist` değerine sahip düğüm işlenir.

```python
def dijkstra(grid, start, end, weights):
    dist = {start: 0}
    heap = [(0, start)]
    prev = {}
    while heap:
        cost, cur = heappop(heap)
        if cur == end:
            return reconstruct(prev, start, end)
        for nb in neighbors(grid, cur):
            w = weights.get(nb, 1)
            nc = cost + w
            if nc < dist.get(nb, inf):
                dist[nb] = nc
                prev[nb] = cur
                heappush(heap, (nc, nb))
    return None
```

### 4.4 A\* (A-Star)

**Dosya:** `js/algorithms.js`, `backend/algorithms/astar.py`

```
Veri yapısı: Min-Heap (f = g + h)
Heuristik: Manhattan mesafesi
Karmaşıklık: O((V + E) log V)
Optimallik: Evet (kabul edilebilir ve tutarlı heuristik ile)
```

A\* her ajan için `agent_id` parametresi alır. Bu, ajanlar arasında çok küçük bir heuristik farklılaşması yaratarak doğal yol dağılımını sağlar:

```python
def heuristic(a, b, agent_id=0):
    return abs(a[0]-b[0]) + abs(a[1]-b[1]) + (agent_id % 3) * 0.001
```

Bu çok küçük epsilon fark, aynı `f` değerine sahip düğümlerde farklı ajan tercihlerine yol açar ve çarpışmayı azaltır.

---

## 5. Simülasyon Motoru

### 5.1 Render Döngüsü

```javascript
function tickSim() {
  // 1. Her ajana advance() çağır (path'te bir adım ilerle)
  // 2. Çarpışma tespiti: aynı pos'ta 2+ ajan → flashTimer = 8
  // 3. flashTimer > 0 olan her ajanı decrement et
  // 4. Canvas temizle, çiz: duvarlar → ağırlık zonları → trail → ajanlar → HUD
  // 5. Tüm ajanlar arrived ise simülasyonu bitir
}

setInterval(tickSim, TICK_MS);  // TICK_MS = 420
```

### 5.2 Çarpışma Tespiti

```javascript
function detectCollisions(agents) {
  const posMap = new Map();
  for (const a of agents) {
    const key = `${a.pos[0]},${a.pos[1]}`;
    if (!posMap.has(key)) posMap.set(key, []);
    posMap.get(key).push(a);
  }
  for (const group of posMap.values()) {
    if (group.length >= 2) {
      group.forEach(a => {
        a.flashTimer = 8;
        a.collided = true;
      });
      collisionCount += group.length - 1;
    }
  }
}
```

`group.length - 1` formülü: 3 ajan aynı hücredeyse 2 çarpışma sayar (3-1=2). Bu, backend'deki hesaplamayla birebir tutarlıdır.

### 5.3 Deterministik Seed

Her iki algoritma da `seed=42` ile çalışır. Aynı LCG (Linear Congruential Generator) hem JS'te hem Python'da implement edilmiştir:

```javascript
// JS
function makeRng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}
```

```python
# Python
def make_rng(seed):
    s = [seed & 0xffffffff]
    def rng():
        s[0] = (s[0] * 1664525 + 1013904223) & 0xffffffff
        return s[0] / 0xffffffff
    return rng
```

Aynı `seed`, `map`, `agents` kombinasyonu her zaman aynı başlangıç/hedef çiftlerini üretir. Bu, iki algoritmanın adil karşılaştırılmasını garanti eder.

---

## 6. Backend API Detayları

### 6.1 Endpoint Listesi

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/health` | Sunucu durum kontrolü |
| GET | `/api/algorithms` | Algoritma meta bilgileri |
| POST | `/api/simulate` | Simülasyon hesaplama |

### 6.2 `/api/simulate` İstek / Yanıt

**İstek:**

```json
{
  "algorithm": "astar",
  "map": 0,
  "agents": 35,
  "seed": 42
}
```

**Yanıt:**

```json
{
  "algorithm": "astar",
  "map": 0,
  "agents": 35,
  "paths": [
    [[1,2], [1,3], [2,3], ...],
    [[5,7], [5,8], ...],
    ...
  ],
  "collisions": 4,
  "total_steps": 1243,
  "duration_ms": 18.7,
  "arrived": 35
}
```

**Doğrulama Kuralları:**

| Alan | Kural |
|------|-------|
| `algorithm` | `bfs`, `dfs`, `dijkstra`, `astar` |
| `map` | `0`, `1`, `2` |
| `agents` | `1` ≤ n ≤ `55` |
| `seed` | Herhangi bir int |

### 6.3 Backend Çarpışma Hesabı

Backend, döndürdüğü `paths` dizisini adım adım simüle ederek çarpışma sayısını hesaplar:

```python
for step in range(max_path_length):
    pos_count = {}
    for path in paths:
        idx = min(step, len(path) - 1)  # hedefe ulaşmış ajan son konumda kalır
        key = (path[idx][0], path[idx][1])
        pos_count[key] = pos_count.get(key, 0) + 1
    for cnt in pos_count.values():
        if cnt >= 2:
            collisions += cnt - 1
```

---

## 7. Frontend Bileşenleri

### 7.1 Three.js Globe (algo-select.js)

Algoritma seçim arayüzü, Three.js ile render edilen interaktif bir 3D globe içerir.

- **Globe mesh:** SphereGeometry, WireframeGeometry → meridyen+paralel çizgileri
- **Fibonacci düğümler:** 28 dekoratif nokta, altın oran spiral dağılımı
  ```javascript
  const phi = Math.acos(1 - 2*(i+0.5)/N);
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;
  ```
- **Algoritma düğümleri:** 4 adet, küre yüzeyine yerleştirilmiş
- **Bağlantı ağı:** Düğümler arası Line geometrileri
- **OrbitControls:** Sürükle/döndür, otomatik rotate

Seçim etkileşimi: düğüme tıklanınca `Raycaster` ile hit tespiti, sağ panelde algoritma detayı açılır.

### 7.2 İstatistik Grafikleri (stats.js)

**Bar Grafiği — Dual Axis:**
- Sol Y ekseni: çarpışma sayısı (0–max)
- Sağ Y ekseni: toplam adım sayısı (farklı ölçek)
- İki algoritma yan yana bar

**Donut Grafikler:**
- Her algoritma için ayrı donut: "Hedefe Ulaşan / Ulaşamayan"

**Kazanan Banner:**
- Çarpışma sayısı daha düşük olan algoritmayı vurgular
- Eşit durumda "BERABERE" gösterir

```javascript
const aWins = d.collisionA < d.collisionB;  // '<' operatörü — eşitlik = kazanan yok
```

### 7.3 Sinematik Giriş (intro.js + main.js)

GSAP ScrollTrigger ile scroll pozisyonu canvas animasyonuna bağlanmıştır:

```javascript
ScrollTrigger.create({
  trigger: '#intro',
  start: 'top top',
  end: 'bottom bottom',
  scrub: true,
  onUpdate: (self) => {
    drawFrame(self.progress);  // 0.0 → 1.0 arası
  }
});
```

`drawFrame(progress)`: progress 0'da şehir ışıkları, 1'de cyan grid görünür.

---

## 8. Tasarım Sistemi

### 8.1 Renk Paleti

```css
--bg-primary:    #000000    /* Ana arka plan */
--bg-secondary:  #0a0a0a    /* Section arka planları */
--bg-card:       #111111    /* Kart ve panel arka planları */
--accent-cyan:   #00d4ff    /* Ana vurgu — Algo A rengi */
--accent-blue:   #0066ff    /* İkincil vurgu */
--text-primary:  #f0ede8    /* Ana yazı */
--text-secondary:#888888    /* Yardımcı yazı */
--collision:     #ff3333    /* Çarpışma flash rengi */
--agent-a:       #00d4ff    /* Sol canvas (Algo A) ajan rengi */
--agent-b:       #ff6600    /* Sağ canvas (Algo B) ajan rengi */
```

### 8.2 Tipografi

| Rol | Font | Kullanım |
|-----|------|----------|
| Başlıklar | Bebas Neue | Hero, bölüm başlıkları |
| Vurgu başlıklar | Anton | Büyük sayılar, stat değerleri |
| Gövde | Space Grotesk | Tüm açıklama metinleri, UI |

### 8.3 Layout Kararları

- **6 full-section** düzeni — her bölüm `min-height: 100vh`
- Simülasyon bölümü: iki canvas yan yana `width: 48%` (2% gap)
- Story bölümü: `200vh/block` — sticky scroll ile crossfade
- Z-index hiyerarşisi: navbar=100, modal=50, canvas overlay=10

---

## 9. Performans Notları

| Metrik | Değer | Not |
|--------|-------|-----|
| Backend hesaplama süresi (A\*, 55 ajan) | ~20–40 ms | Python, senkron |
| Canvas render hızı | 420 ms/adım | Kasıtlı yavaş — demo için |
| Maksimum ajan sayısı | 55 | Backend validasyonu |
| Grid boyutu | 20×30 = 600 hücre | Her tick'te O(ajan×600) kontrol |
| Three.js FPS | ~60 | requestAnimationFrame |

A\* için `agent_id % 3 * 0.001` heuristik epsilon farkı, priority queue sıralamasını etkileyecek kadar büyük değil; sadece tie-breaking için yeterli.

---

## 10. Bilinen Sınırlamalar ve Gelecek Geliştirmeler

### Mevcut Sınırlamalar

| Konu | Açıklama |
|------|----------|
| Koordineli kaçınma yok | Ajanlar yollarını önceden hesaplar, birbirlerini gerçek zamanlı görmez |
| Statik engeller | Grid sabit, simülasyon sırasında duvar ekleme/silme yok |
| Tek hedef modeli | Tüm ajanlar tek bir ortak hedefe gidiyor (grup davranışı simüle edilmiyor) |
| Mobil uyum | Canvas iki sütun yan yana küçük ekranda kırılıyor |
| Video entegrasyonu | `videos/intro.mp4` ve story videoları yer tutucu |

### Önerilen Gelecek Geliştirmeler

1. **Flow Field Pathfinding** — Tüm grid için tek vektör alanı hesapla, ajan başına tekrar hesaplama yok → O(1) ajan sorgu maliyeti
2. **Dinamik engel güncellemesi** — Simülasyon sırasında kullanıcı tıklamayla duvar ekleyebilsin
3. **Prioritized Planning (WHCA\*)** — Ajanlar sırayla planlasın, önce planlanan ajanın yolu sonraki için engel sayılsın
4. **WebWorker** — Canvas render ana thread'den, algoritma hesabı worker thread'den → UI donmaz
5. **Responsive Canvas** — CSS `aspect-ratio` + `ResizeObserver` ile canvas boyutunu dinamik hesapla

---

## 11. Proje Dosya Listesi

```
index.html                   Single Page App giriş noktası
css/style.css                Dark tema, CSS değişkenleri, tüm bileşen stilleri
js/main.js                   Lenis smooth scroll, GSAP ScrollTrigger init, story bölümü
js/hero.js                   Three.js TorusKnot, GSAP giriş animasyonu
js/intro.js                  Scroll-driven canvas: şehir ışıkları → cyan grid
js/algo-select.js            Three.js globe, algoritma seçim UI, slot yönetimi
js/algorithms.js             BFS, DFS, Dijkstra, A* — vanilla JS, window.Algorithms
js/simulation.js             Grid sınıfı, Agent sınıfı, Canvas renderer, çarpışma
js/stats.js                  Chart.js grafikleri, window.renderCharts()
backend/app.py               Flask API, MAPS, WEIGHT_ZONES, seed sistemi
backend/algorithms/__init__.py
backend/algorithms/bfs.py
backend/algorithms/dfs.py
backend/algorithms/dijkstra.py
backend/algorithms/astar.py
assets/maps/                 (boş — PNG gelince otomatik devreye girer)
images/BFS.png               Algoritma paneli görselleri
images/DFS.png
images/Dijkstra.png
images/AStar.png
```
