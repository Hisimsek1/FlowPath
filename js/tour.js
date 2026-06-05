/* tour.js — Simülasyon onboarding turu */

(function () {

  const ALGO_META = {
    bfs: {
      name: 'BFS',
      full: 'Genişlik Öncelikli Arama',
      timeComplex: 'O(V + E)',
      spaceComplex: 'O(V)',
      color: '#00d4ff',
      desc: 'Başlangıç noktasından katman katman genişleyerek ilerler. Tüm ajanlar aynı deterministik yolu takip eder — dar koridorlarda çarpışma kaçınılmaz.',
      riskLabel: 'ÇARPIŞMA RİSKİ: YÜKSEK',
      riskClass: 'risk-high',
    },
    dfs: {
      name: 'DFS',
      full: 'Derinlik Öncelikli Arama',
      timeComplex: 'O(V + E)',
      spaceComplex: 'O(V)',
      color: '#ff3cac',
      desc: 'Bir yönde sonuna kadar gider, çıkmaza girince geri döner. Optimal olmayan uzun ve kaotik rotalar üretir.',
      riskLabel: 'ÇARPIŞMA RİSKİ: ÇOK YÜKSEK',
      riskClass: 'risk-high',
    },
    dijkstra: {
      name: 'Dijkstra',
      full: 'Ağırlıklı En Kısa Yol',
      timeComplex: 'O((V+E) log V)',
      spaceComplex: 'O(V)',
      color: '#7fff00',
      desc: 'Her hücrenin maliyetini hesaplar. Ağır bölgelerden kaçınır. Önünde başka bir ajan varsa bekler, sonra geçer.',
      riskLabel: 'ÇARPIŞMA RİSKİ: DÜŞÜK',
      riskClass: 'risk-low',
    },
    astar: {
      name: 'A*',
      full: 'Sezgisel Yol Bulma',
      timeComplex: 'O((V+E) log V)',
      spaceComplex: 'O(V)',
      color: '#ffd700',
      desc: 'Dijkstra + Manhattan uzaklığı sezgiseli. Hedefe yönelerek çok daha az düğüm keşfeder. Her ajan farklı rota seçer.',
      riskLabel: 'ÇARPIŞMA RİSKİ: ÇOK DÜŞÜK',
      riskClass: 'risk-low',
    },
  };

  function buildSteps(algos) {
    const metaA = ALGO_META[algos[0]] || ALGO_META.bfs;
    const metaB = ALGO_META[algos[1]] || ALGO_META.astar;
    const nameA = metaA.name === 'A*' ? 'A*' : metaA.name;
    const nameB = metaB.name === 'A*' ? 'A*' : metaB.name;

    return [
      {
        title: 'Simülasyon Hazır',
        html: `
          <p>Ajanlar haritaya yerleştirildi. Simülasyona başlamadan önce sana kısaca anlatalım.</p>
          <div class="tour-vs-badge">
            <span style="color:${metaA.color}">${nameA}</span>
            <span class="tour-vs-sep">vs</span>
            <span style="color:${metaB.color}">${nameB}</span>
          </div>
          <p class="tour-sub">Aynı harita, aynı ajanlar — sadece yol bulma stratejisi farklı.</p>
        `,
      },
      {
        title: 'Ajanlar ve Hedefler',
        html: `
          <div class="tour-legend">
            <div class="tour-legend-item">
              <span class="tour-agent-dot" style="background:${metaA.color}"></span>
              <span>Ajan — başlangıç noktası</span>
            </div>
            <div class="tour-legend-item">
              <span class="tour-target-ring"></span>
              <span>Hedef — ulaşılacak nokta</span>
            </div>
          </div>
          <p>Her renkli daire bir ajandır. Başlangıç noktasından kendi hedefine (küçük halka) ulaşmaya çalışır. Her iki kanvasta da <strong>aynı başlangıç ve hedef</strong> noktaları kullanılır.</p>
        `,
      },
      {
        title: nameA + ' — ' + metaA.full,
        html: `
          <div class="tour-badge" style="border-color:${metaA.color};color:${metaA.color}">${metaA.timeComplex} &nbsp;|&nbsp; ${metaA.spaceComplex}</div>
          <p>${metaA.desc}</p>
          <div class="tour-risk ${metaA.riskClass}">${metaA.riskLabel}</div>
        `,
      },
      {
        title: nameB + ' — ' + metaB.full,
        html: `
          <div class="tour-badge" style="border-color:${metaB.color};color:${metaB.color}">${metaB.timeComplex} &nbsp;|&nbsp; ${metaB.spaceComplex}</div>
          <p>${metaB.desc}</p>
          <div class="tour-risk ${metaB.riskClass}">${metaB.riskLabel}</div>
        `,
      },
      {
        title: 'Çarpışma Sistemi',
        html: `
          <div class="tour-collision-row">
            <div class="tour-collision-dot"></div>
            <div class="tour-collision-dot" style="animation-delay:0.15s"></div>
          </div>
          <p>İki ajan aynı hücreye girerse <span class="tour-highlight-red">kırmızı patlama</span> — bu bir çarpışma.</p>
          <p class="tour-sub"><strong>${nameA}:</strong> diğer ajanları görmezden gelir, doğrudan ilerler.<br>
          <strong>${nameB}:</strong> önünde ajan varsa 1-3 tick bekler, sonra geçer.</p>
          <p class="tour-sub">Sonuçta istatistik tablosunda bu fark net görünecek.</p>
        `,
      },
    ];
  }

  function createOverlay() {
    const el = document.createElement('div');
    el.id = 'tour-overlay';
    el.innerHTML = `
      <div class="tour-backdrop" id="tour-backdrop"></div>
      <div class="tour-card" id="tour-card">
        <div class="tour-step-dots" id="tour-step-dots"></div>
        <div class="tour-body" id="tour-body"></div>
        <div class="tour-actions">
          <button class="tour-skip" id="tour-skip">Atla ve Başlat</button>
          <button class="tour-next" id="tour-next">İleri →</button>
        </div>
      </div>
    `;
    document.body.appendChild(el);
    return el;
  }

  window.runTour = function (algos, onComplete) {
    const steps   = buildSteps(algos);
    const overlay = createOverlay();
    const card    = document.getElementById('tour-card');
    const dotsEl  = document.getElementById('tour-step-dots');
    const bodyEl  = document.getElementById('tour-body');
    const nextBtn = document.getElementById('tour-next');
    const skipBtn = document.getElementById('tour-skip');
    let current   = 0;

    function render() {
      const s = steps[current];

      // Nokta göstergesi
      dotsEl.innerHTML = steps.map((_, i) => {
        let cls = 'tour-dot';
        if (i === current) cls += ' active';
        else if (i < current) cls += ' done';
        return `<span class="${cls}"></span>`;
      }).join('');

      // İçerik
      bodyEl.innerHTML = `<h3 class="tour-title">${s.title}</h3>${s.html}`;

      // Son adımda buton rengi değişir
      const isLast = current === steps.length - 1;
      nextBtn.textContent = isLast ? 'Simülasyonu Başlat ▶' : 'İleri →';
      nextBtn.classList.toggle('tour-next-last', isLast);

      // Kart animasyonu
      card.style.animation = 'none';
      void card.offsetHeight;
      card.style.animation = 'tourCardIn 0.28s ease forwards';
    }

    function close(start) {
      overlay.classList.add('tour-closing');
      setTimeout(() => {
        overlay.remove();
        if (start) onComplete();
      }, 280);
    }

    nextBtn.addEventListener('click', () => {
      if (current < steps.length - 1) {
        current++;
        render();
      } else {
        close(true);
      }
    });

    skipBtn.addEventListener('click', () => close(true));

    // Backdrop tıklama ile atla
    document.getElementById('tour-backdrop').addEventListener('click', () => close(true));

    render();
  };

})();
