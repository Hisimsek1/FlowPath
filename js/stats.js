/* stats.js — Chart.js grafikleri + algoritma karmaşıklık analizi */

(function () {
  let chartCollision = null;
  let chartSteps     = null;

  const CHART_DEFAULTS = {
    color: '#f0ede8',
    gridColor: 'rgba(240,237,232,0.08)',
    accentA: '#00d4ff',
    accentB: '#ff6b35',
  };

  // ── Algoritma karmaşıklık veritabanı ─────────────────────
  const ALGO_COMPLEXITY = {
    bfs: {
      displayName: 'BFS',
      fullName:    'Breadth-First Search',
      time:        'O(V + E)',
      space:       'O(V)',
      optimal:     'Evet (ağırlıksız)',
      complete:    'Evet',
      heuristic:   'Hayır',
      badge:       'SUBOPTIMAL',
      badgeClass:  'badge-bad',
      desc: 'En kısa yolu adım sayısı olarak bulur, ancak hücre ağırlıklarını görmezden gelir. Tüm ajanlar deterministik olarak aynı yolu izler — kalabalık ortamda çarpışma kaçınılmazdır.',
    },
    dfs: {
      displayName: 'DFS',
      fullName:    'Depth-First Search',
      time:        'O(V + E)',
      space:       'O(V)',
      optimal:     'Hayır',
      complete:    'Hayır (döngülü)',
      heuristic:   'Hayır',
      badge:       'SUBOPTIMAL',
      badgeClass:  'badge-bad',
      desc: 'Bir yönde sonuna kadar gider, çıkmaza girince geri döner. Optimal olmayan uzun ve kaotik yollar üretir. En yüksek çarpışma oranı.',
    },
    dijkstra: {
      displayName: 'Dijkstra',
      fullName:    "Dijkstra's Algorithm",
      time:        'O((V+E) log V)',
      space:       'O(V)',
      optimal:     'Evet',
      complete:    'Evet',
      heuristic:   'Hayır',
      badge:       'OPTİMAL',
      badgeClass:  'badge-good',
      desc: 'Her hücrenin maliyetini hesaplar. Ağır bölgelerden kaçınarak maliyet olarak en kısa yolu garanti eder. Ajanlar arası cooperative bekleme ile çarpışmayı minimize eder.',
    },
    astar: {
      displayName: 'A*',
      fullName:    'A-Star Algorithm',
      time:        'O((V+E) log V)',
      space:       'O(V)',
      optimal:     'Evet',
      complete:    'Evet',
      heuristic:   'Evet — Manhattan',
      badge:       'OPTİMAL + HIZLI',
      badgeClass:  'badge-good',
      desc: "Dijkstra'ya Manhattan uzaklığı sezgiseli ekler. Hedefe yönelerek çok daha az düğüm keşfeder. Her ajana farklı tie-breaking gürültüsü ile benzersiz rotalar üretir — minimum çarpışma.",
    },
  };

  // Seçilen çift için açıklama
  const WHY_PAIRS = {
    'bfs-dijkstra':  'BFS tüm hücreleri eşit ağırlıklı kabul eder ve ajanlar aynı deterministik yolu izler. Dijkstra ağır bölgelerden kaçınır ve diğer ajanlar önüne geldiğinde bekler — bu iki mekanizma çarpışma sayısını dramatik biçimde düşürür.',
    'bfs-astar':     'BFS kör bir arama algoritmasıdır — ne ağırlıkları ne de diğer ajanları dikkate alır. A* hem ağırlıklı maliyeti hem de hedef yönünü hesaba katar; her ajana özgü yol gürültüsü ile ajanlar farklı rotalar seçer.',
    'dfs-dijkstra':  'DFS kaotik ve uzun rotalar üretir, hiçbir maliyet optimizasyonu yapmaz. Dijkstra sistematik olarak en düşük maliyetli yolu bulur ve diğer ajanlar önünde bekleme mekanizması ile çarpışmaları önler.',
    'dfs-astar':     "DFS'in kaotik rotaları ile A*'ın hedefe yönelik akıllı araması karşılaştırmasında fark çok belirgindir. A* en az sayıda düğüm keşfederek hem hızlı hem de çarpışmasız ulaşır.",
    'bfs-dfs':       'Her iki algoritma da ağırlıkları ve diğer ajanları görmezden gelir. BFS en kısa adım sayılı yolu bulurken DFS çok daha uzun ve kaotik rotalar üretir. Her ikisi de yüksek çarpışma oranı gösterir.',
    'dijkstra-astar': "Her ikisi de optimal ve cooperative çalışır, bu yüzden çarpışma farkı küçüktür. A* heuristic sayesinde daha az düğüm keşfeder — büyük haritalarda bu Dijkstra'ya göre belirgin bir hız avantajı yaratır.",
  };

  function destroyCharts() {
    if (chartCollision) { chartCollision.destroy(); chartCollision = null; }
    if (chartSteps)     { chartSteps.destroy();     chartSteps = null; }
  }

  function renderComplexity(keyA, keyB) {
    const section  = document.getElementById('complexity-section');
    const cardsEl  = document.getElementById('complexity-cards');
    const whyEl    = document.getElementById('algo-why-block');
    if (!section || !cardsEl) return;

    section.style.display = 'block';

    const infoA = ALGO_COMPLEXITY[keyA];
    const infoB = ALGO_COMPLEXITY[keyB];

    function makeCard(info) {
      if (!info) return '';
      const rows = [
        ['Zaman Karmaşıklığı', info.time],
        ['Alan Karmaşıklığı',  info.space],
        ['Optimal?',           info.optimal],
        ['Tam (Complete)?',    info.complete],
        ['Sezgisel?',          info.heuristic],
      ];
      return `
        <div class="complexity-card">
          <div class="complexity-card-top">
            <span class="complexity-card-name">${info.displayName}</span>
            <span class="complexity-badge ${info.badgeClass}">${info.badge}</span>
          </div>
          <p class="complexity-full-name">${info.fullName}</p>
          <table class="complexity-table">
            ${rows.map(([label, val]) => `
              <tr>
                <td class="complexity-label">${label}</td>
                <td class="complexity-val">${val}</td>
              </tr>
            `).join('')}
          </table>
          <p class="complexity-desc">${info.desc}</p>
        </div>
      `;
    }

    cardsEl.innerHTML = makeCard(infoA) + makeCard(infoB);

    // "Neden bu farkı gördük?" açıklaması
    const pairKey = [keyA, keyB].sort().join('-');
    const whyText = WHY_PAIRS[pairKey] ||
      `${infoA?.displayName || keyA} ile ${infoB?.displayName || keyB} arasındaki performans farkı yukarıdaki grafiklerde açıkça görülmektedir.`;

    if (whyEl) {
      whyEl.innerHTML = `
        <h4>Neden Bu Farkı Gördük?</h4>
        <p>${whyText}</p>
      `;
    }
  }

  window.renderCharts = function () {
    const d = window._simStats;
    if (!d) return;
    destroyCharts();

    const baseOptions = {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: CHART_DEFAULTS.color, font: { family: 'Space Grotesk', size: 12 } },
        },
      },
      scales: {
        x: {
          ticks: { color: CHART_DEFAULTS.color },
          grid:  { color: CHART_DEFAULTS.gridColor },
        },
        y: {
          ticks: { color: CHART_DEFAULTS.color },
          grid:  { color: CHART_DEFAULTS.gridColor },
          beginAtZero: true,
        },
      },
    };

    // Bar chart — çarpışma karşılaştırması
    const ctxColl = document.getElementById('chart-collision');
    if (ctxColl) {
      chartCollision = new Chart(ctxColl, {
        type: 'bar',
        data: {
          labels: ['Çarpışma Sayısı'],
          datasets: [
            {
              label: d.algoA,
              data: [d.collisionA],
              backgroundColor: CHART_DEFAULTS.accentA + '99',
              borderColor: CHART_DEFAULTS.accentA,
              borderWidth: 2,
              borderRadius: 6,
            },
            {
              label: d.algoB,
              data: [d.collisionB],
              backgroundColor: CHART_DEFAULTS.accentB + '99',
              borderColor: CHART_DEFAULTS.accentB,
              borderWidth: 2,
              borderRadius: 6,
            },
          ],
        },
        options: {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            title: {
              display: true,
              text: 'Çarpışma Karşılaştırması',
              color: CHART_DEFAULTS.color,
              font: { family: 'Space Grotesk', size: 14, weight: '600' },
            },
          },
        },
      });
    }

    // Bar chart — toplam adım karşılaştırması
    const ctxSteps = document.getElementById('chart-steps');
    if (ctxSteps) {
      chartSteps = new Chart(ctxSteps, {
        type: 'bar',
        data: {
          labels: ['Toplam Adım'],
          datasets: [
            {
              label: d.algoA,
              data: [d.stepsA],
              backgroundColor: CHART_DEFAULTS.accentA + '99',
              borderColor: CHART_DEFAULTS.accentA,
              borderWidth: 2,
              borderRadius: 6,
            },
            {
              label: d.algoB,
              data: [d.stepsB],
              backgroundColor: CHART_DEFAULTS.accentB + '99',
              borderColor: CHART_DEFAULTS.accentB,
              borderWidth: 2,
              borderRadius: 6,
            },
          ],
        },
        options: {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            title: {
              display: true,
              text: 'Toplam Adım Karşılaştırması',
              color: CHART_DEFAULTS.color,
              font: { family: 'Space Grotesk', size: 14, weight: '600' },
            },
          },
        },
      });
    }

    // Karmaşıklık bölümünü doldur
    const keyA = (d.algoKeyA || d.algoA || '').toLowerCase().replace('*', 'star').replace('-', '');
    const keyB = (d.algoKeyB || d.algoB || '').toLowerCase().replace('*', 'star').replace('-', '');
    renderComplexity(keyA, keyB);
  };
})();
