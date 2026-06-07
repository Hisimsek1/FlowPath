# SUNUM.md — FlowPath Proje Sunumu

> **Sunum Rehberi**
>
> Bu dosya sunu hazırlarken neyin nereye gideceğini gösterir.
> Her slayt için içerik önerisi, eklenecek görsel / ekran görüntüsü ve anlatım noktaları verilmiştir.
>
> **Kapak slaytına** grup isimlerinizi, öğrenci numaralarınızı, ders adını ve tarihi ekleyiniz.
> **Kapanış slaytına** "Teşekkürler / Sorular" ifadesini ve iletişim bilgilerinizi ekleyiniz.
> Bu iki slayt dahil toplam slayt sayısı 7–9 arasında kalmalı; aşağıdaki 7 içerik slaydı bunların arasına girer.

---

## SLAYT 1 — Problem: Neden Yol Bulma Zor?

### Ne Anlatılacak?

- Gerçek dünya senaryosu: havalimanı kalabalığı, şehir trafiği, oyun NPC'leri
- 10 ajan olduğunda sorun yok; 50 ajan aynı en kısa yolu seçerse tıkanma kaçınılmaz
- **Temel soru:** Hangi algoritma en kalabalık ortamda en az çarpışmayla hedefe ulaştırır?

### Önerilen Görsel

- Sitenin **Hero bölümünün ekran görüntüsü** — büyük FLOWPATH yazısı, arkasında dönen Three.js cismi
- Alternatif olarak: kalabalık yaya geçidi veya oyun karakterleri ekran görüntüsü

> **SS Alınacak Yer:** Siteyi açtığınızda ilk ekran — `http://localhost:8080` veya Live Server.
> Hero tam ekranda görünüyor olmalı. Tarayıcıyı tam ekrana al, F5 ile yenile, hemen SS al.

### Anlatım Noktaları (30 sn)

1. "Bu problem havaalanı simülasyonlarından oyun motorlarına kadar her yerde var."
2. "Az ajanda fark yok. Ajan sayısı artınca algoritma seçimi kritik hale geliyor."
3. "FlowPath bunu görsel olarak kanıtlamak için yaptığımız bir platform."

---

## SLAYT 2 — Algoritmalara Giriş: 4 Yaklaşım, 1 Problem

### Ne Anlatılacak?

- BFS, DFS, Dijkstra, A\* kısa karşılaştırma tablosu
- Her birinin karakteristik özelliği tek cümleyle
- Neden 4 farklı algoritma? → Uninformed vs Informed, Optimal vs Değil

### Önerilen Görsel

- Sitenin **Algoritma Seçim bölümünün ekran görüntüsü** — sağdaki detay paneli açık, bir algoritma seçili
- En iyisi: A\* seçiliyken sağ panelin tam görünümü (badge, açıklama, özellikler)

> **SS Alınacak Yer:** Siteyi aşağı scroll'la, "Algoritma Seç" bölümüne gel (Bölüm 4).
> Globe üzerindeki bir algoritmaya tıkla, sağ panelin açıldığını gör.
> "A\*" seçiliyken — badge "Informed", collision "Çok Düşük ↓↓" yazıyor — SS al.
> Alternatif: tüm globe'un görüntüsü de ilgi çekici olur.

### Tablo (Slayta Eklenecek)

| Algoritma | Arama Türü | Optimal? | Ağırlık Bilir? |
|-----------|-----------|----------|---------------|
| BFS       | Genişlik önce | Evet (adım) | Hayır |
| DFS       | Derinlik önce | Hayır | Hayır |
| Dijkstra  | Maliyet önce | Evet | Evet |
| A\*       | Sezgisel | Evet | Evet |

### Anlatım Noktaları (45 sn)

1. "BFS ve DFS 'kör' arama — ağırlık bilmiyorlar."
2. "Dijkstra ve A\* ağırlıklı grid'de pahalı yollardan kaçabiliyor."
3. "A\* üstüne bir de Manhattan mesafesi sezgiseli ekliyor, bu yüzden en hızlı ve akıllı."

---

## SLAYT 3 — Sistem Mimarisi & Teknik Yapı

### Ne Anlatılacak?

- Frontend (Vanilla JS + Canvas) ↔ Backend (Python Flask) ayrımı
- Simülasyon akışı: kullanıcı seçim → POST /api/simulate → JSON yanıt → Canvas render
- Neden hem JS hem Python? → Canvas için anlık render JS'te, ağır hesaplama backend'de

### Önerilen Görsel

**Seçenek A (daha kolay):** Aşağıdaki mimari diyagramı slayta metin/şekil olarak ekle:

```
[Kullanıcı]
    ↓ algoritma + harita + ajan sayısı
[Frontend — index.html]
    ├── algo-select.js  → 2 algoritma seçimi
    ├── simulation.js   → Canvas render + Agent sınıfı
    └── stats.js        → Chart.js istatistikler
         ↕ fetch POST /api/simulate
[Backend — Flask app.py]
    └── algorithms/ → bfs.py, dfs.py, dijkstra.py, astar.py
         ↓ JSON { paths, collisions, total_steps, duration_ms }
[Frontend]
    └── Canvas: ajanları adım adım oynat
```

**Seçenek B:** Tarayıcı DevTools'u aç (F12 → Network), simülasyonu başlat, POST isteğini seç, Request/Response görünümünün SS'ini al.

> **SS Alınacak Yer (Seçenek B):** Chrome → F12 → Network sekmesi → Simülasyonu başlat → `simulate` isteğine tıkla → Sağda Response görünür → SS al.

### Anlatım Noktaları (45 sn)

1. "Aynı `seed` değeri hem frontend hem backend'e gönderiliyor — iki algoritma birebir aynı başlangıç/hedef noktalarını kullanıyor."
2. "Backend yolları hesaplıyor; frontend bu yolları 420ms aralıklarla animasyonlu oynatıyor."
3. "Backend çalışmıyorsa JS motoru yedekte devreye giriyor."

---

## SLAYT 4 — Simülasyon: Canvasın İçinde Ne Oluyor?

### Ne Anlatılacak?

- 20×30 grid, 3 farklı harita türü
- Ağırlık zonu sistemi — merkez bölge weight=3, BFS görmez, A\* geçmez
- Çarpışma tespiti: aynı tick'te aynı hücrede 2+ ajan → kırmızı flash
- Trail sistemi: 8 kare geçmiş iz, her ajanın rengi farklı

### Önerilen Görsel

**Mutlaka alınması gereken SS:** Simülasyon **çalışırken** — ajanlar harekette, en az bir çarpışma (kırmızı flash) görünür halde, sol üstte HUD sayaçları aktif.

> **SS Alınacak Yer:**
> 1. Bölüm 4'te BFS + DFS seç (çarpışma çok fazla olur, gösterişli görünür)
> 2. Bölüm 5'te Harita 0 (Şehir Izgarası) seç, ajan sayısını 35 yap
> 3. "BAŞLAT" butonuna bas
> 4. Birkaç saniye sonra harekete geçince SS al — kırmızı noktalar (çarpışma) görünüyor olmalı
>
> **İkinci SS önerisi:** Sadece sol canvas (BFS) ve sadece sağ canvas (A\*) ayrı ayrı crop edilmiş hali — fark daha belirgin görünür.

### Sol Canvas (BFS) / Sağ Canvas (A\*) Farkını Anlatan Tablo (Slayta Ekle)

| Özellik | Sol (BFS) | Sağ (A\*) |
|---------|-----------|-----------|
| Ajan rengi | Cyan | Turuncu |
| Yol seçimi | Sabit sıra, tekrar eden rotalar | Sezgisel, dağıtılmış |
| Çarpışma | Yüksek (kırmızı flash sık) | Düşük |
| Ağırlık | Görmez | Pahalı bölgeden kaçar |

### Anlatım Noktaları (60 sn)

1. "BFS tüm ajanlara aynı yön sırasını uyguladığı için ajanlar aynı koridora akıyor."
2. "A\* her ajanın ID'sine göre hafif farklılaşan heuristik hesaplıyor — bu doğal dağılımı sağlıyor."
3. "Kırmızı flash: o tick'te aynı hücrede 2+ ajan var demek."
4. "Ağırlık zonları: merkez grid weight=3 — BFS bu maliyeti hesaplamıyor, A\* hesaplıyor ve etrafından dolaşıyor."

---

## SLAYT 5 — İstatistikler: Sayılar Ne Diyor?

### Ne Anlatılacak?

- Simülasyon bitince otomatik açılan istatistik paneli
- Çarpışma bar grafiği (sol eksen), adım bar grafiği (sağ eksen — dual axis)
- Kazanan banner + donut grafikleri
- Gerçek deney sonuçları: hangi konfigürasyonda hangi algoritma kazandı?

### Önerilen Görsel

**Mutlaka alınması gereken SS:** İstatistik paneli açıkken tam sayfa görünüm.

> **SS Alınacak Yer:**
> Simülasyonu tamamla (35 ajan, Harita 0, BFS vs A\*).
> Ekran otomatik istatistik bölümüne scroll edecek.
> Bar grafiği + kazanan banner görünür halde SS al.
> Farklı kombinasyonlar için aşağıdaki sonuçları göster:

### Örnek Deney Sonuçları Tablosu (Slayta Ekle)

> Simülasyonu kendiniz çalıştırıp gerçek değerleri buraya yazın. Aşağıdakiler örnek yapıdır:

| Harita | Ajan | Algo A | Çarpışma A | Algo B | Çarpışma B | Kazanan |
|--------|------|--------|-----------|--------|-----------|---------|
| Şehir Izgarası | 5 | BFS | ~2 | A\* | ~1 | — (fark az) |
| Şehir Izgarası | 35 | BFS | ~XX | A\* | ~XX | A\* |
| Labirent | 25 | DFS | ~XX | Dijkstra | ~XX | Dijkstra |

> **Not:** Tablodaki XX değerlerini gerçek deney çıktısıyla doldurun. Değerler simülasyon ekranında HUD'da ve istatistik panelinde görünür.

### Anlatım Noktaları (45 sn)

1. "5 ajanda fark yok — temel iddiamızı doğrulayan önemli bir nokta."
2. "35 ajanda BFS, A\*'a kıyasla X kat daha fazla çarpışma yaşadı."
3. "Adım sayısında DFS beklendiği gibi en uzun yolu çiziyor — zaman kaybı, kaos."

---

## SLAYT 6 — Demo: Canlı Gösterim

### Ne Anlatılacak?

Sunum sırasında siteyi canlı açın ve şu akışı gösterin:

1. Hero'ya gelin — Three.js cismi dönsün
2. Scroll yapın — smooth Lenis scrollu seyrettirin
3. Algoritma seçim bölümüne gelin — Globe'a tıklayın, panelleri gösterin
4. BFS ve DFS'i seçin → devam edin
5. Harita 0, 35 ajan seçin → Başlat'a basın
6. Çarpışmaları canlı gösterin
7. Simülasyon bitince istatistik panelini gösterin
8. Tekrar yapın — BFS yerine A\* seçin — farkı gösterin

### Önerilen Görsel

Bu slayta büyük harflerle **"CANLI DEMO"** veya sitenin URL'si yazılabilir. Ekran görüntüsü yerine canlı gösteri daha etkili.

> **Hazırlık notu:**
> - Sunum öncesinde `python app.py` çalışır durumda olmalı
> - Tarayıcı sekmesi hazır açık olmalı
> - İlk scroll animasyonu tekrar tetiklenmez; sayfayı F5 ile tazele

### Anlatım Noktaları (90 sn — canlı demo)

1. "Şimdi canlı olarak göreceğiz — aynı harita, aynı başlangıç noktaları, iki farklı algoritma."
2. Başlat → bekle → "BFS kanalları doldurmaya başladı, kırmızı noktalar çarpışma."
3. "Şimdi aynısını A\* ile yapıyorum." → tekrar başlat → karşılaştır.

---

## SLAYT 7 — Bulgular & Sonuçlar

### Ne Anlatılacak?

- Hipotez doğrulandı mı? (az ajan: fark yok, çok ajan: fark belirgin)
- En çok çarpışma: DFS > BFS > Dijkstra > A\*
- En uzun yol: DFS (optimal değil)
- En hızlı hedefe ulaşan: A\* (adım + maliyet dengeli)
- Proje sınırlamaları: koordineli kaçınma yok (her ajan kendi yolundan gidiyor)
- Gelecek: flow field pathfinding, dinamik engel güncellemesi

### Önerilen Görsel

İstatistik panelinin en çarpıcı sonucunu gösteren SS — kazanan banner + bar grafiği bir arada.

> **SS Alınacak Yer:** BFS vs A\*, Harita 0, 55 ajan konfigürasyonu — maksimum fark bu kombinasyonda görünür.

### Anlatım Noktaları (45 sn)

1. "Sonuç net: algoritma seçimi ajan sayısı arttıkça giderek daha kritik hale geliyor."
2. "A\* oyun motorlarında neden standart haline geldiğini simülasyon sayısal olarak gösterdi."
3. "Sınırlamamız şu: ajanlar birbirini 'görmüyor', koordineli kaçınma yok. Gerçek oyun motorlarında bu da var."

---

## Sunum Zamanlama Özeti

| Slayt | İçerik | Süre |
|-------|--------|------|
| Kapak | İsim, numara, ders, tarih | 30 sn |
| 1 | Problem | 30 sn |
| 2 | Algoritmalar | 45 sn |
| 3 | Mimari | 45 sn |
| 4 | Simülasyon | 60 sn |
| 5 | İstatistikler | 45 sn |
| 6 | Canlı Demo | 90 sn |
| 7 | Sonuçlar | 45 sn |
| Kapanış | Teşekkürler / Sorular | 30 sn |
| **Toplam** | | **~7 dk** |

---

## Görsel Toparlama Listesi (Kontrol et)

- [ ] SS 1: Hero bölümü tam ekran (FLOWPATH + dönen cisim)
- [ ] SS 2: Algoritma seçim globe'u — A\* seçili, sağ panel açık
- [ ] SS 3: Mimari diyagram veya DevTools Network SS
- [ ] SS 4: Simülasyon çalışırken — kırmızı flash görünür, HUD aktif
- [ ] SS 5: İstatistik paneli — bar grafik + kazanan banner
- [ ] SS 6: Canlı demo için hazırlık (SS gerekmez)
- [ ] SS 7: BFS vs A\*, 55 ajan, en yüksek fark gösteren istatistik
