/* stats.js — Chart.js grafikleri + winner banner + donut */

(function () {
  let chartCollision = null;
  let chartDonutA    = null;
  let chartDonutB    = null;

  // Tema renkleri — dark temaya uygun
  const COLOR_A   = '#00d4ff';  // cyan
  const COLOR_B   = '#c084fc';  // lavanta
  const COLOR_DIM = 'rgba(255,255,255,0.08)';
  const FONT      = 'Space Grotesk';
  const TEXT      = '#f0ede8';
  const GRID_LINE = 'rgba(240,237,232,0.07)';

  function destroyCharts() {
    if (chartCollision) { chartCollision.destroy(); chartCollision = null; }
    if (chartDonutA)    { chartDonutA.destroy();    chartDonutA    = null; }
    if (chartDonutB)    { chartDonutB.destroy();    chartDonutB    = null; }
  }

  // ── Kazanan banner ────────────────────────────────────────
  function renderWinnerBanner(d) {
    const el = document.getElementById('stats-winner-banner');
    if (!el) return;

    const aWins      = d.collisionA < d.collisionB;
    const tie        = d.collisionA === d.collisionB;
    const winnerName = tie ? null : (aWins ? d.algoA : d.algoB);
    const winnerClr  = tie ? TEXT  : (aWins ? COLOR_A : COLOR_B);

    if (tie) {
      el.innerHTML = `<span class="winner-label">BERABERE</span>`;
      el.style.borderColor = 'rgba(255,255,255,0.2)';
    } else {
      el.innerHTML = `
        <span class="winner-label">KAZANAN</span>
        <span class="winner-name" style="color:${winnerClr}">${winnerName}</span>
        <span class="winner-sub">${aWins ? d.collisionA : d.collisionB} çarpışma &nbsp;vs&nbsp; ${aWins ? d.collisionB : d.collisionA}</span>
      `;
      el.style.borderColor = winnerClr + '55';
    }
  }

  // ── Skor kartları ────────────────────────────────────────
  function renderScoreCards(d) {
    function card(elId, name, collisions, color, isWinner) {
      const el = document.getElementById(elId);
      if (!el) return;
      el.style.borderColor = isWinner ? color + '55' : 'rgba(255,255,255,0.05)';
      el.innerHTML = `
        <span class="score-algo-name" style="color:${color}">${name}</span>
        <span class="score-big" style="color:${isWinner ? color : 'rgba(255,255,255,0.3)'}">${collisions}</span>
        <span class="score-unit">çarpışma</span>
        ${isWinner ? `<span class="score-badge" style="background:${color}1a;color:${color};border-color:${color}44">DAHA İYİ</span>` : ''}
      `;
    }

    const aWins = d.collisionA < d.collisionB;
    card('stats-score-a', d.algoA, d.collisionA, COLOR_A,  aWins);
    card('stats-score-b', d.algoB, d.collisionB, COLOR_B, !aWins);
  }

  // ── Bar chart — çarpışma + adım karşılaştırması ───────────
  function renderCollisionChart(d) {
    const ctx = document.getElementById('chart-collision');
    if (!ctx) return;

    chartCollision = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [d.algoA, d.algoB],
        datasets: [
          {
            label: 'Çarpışma',
            data: [d.collisionA, d.collisionB],
            backgroundColor: [COLOR_A + '2e', COLOR_B + '2e'],
            borderColor: [COLOR_A, COLOR_B],
            borderWidth: 2,
            borderRadius: 6,
            yAxisID: 'y',
          },
          {
            label: 'Toplam Adım',
            data: [d.stepsA, d.stepsB],
            backgroundColor: [COLOR_A + '15', COLOR_B + '15'],
            borderColor: [COLOR_A + '88', COLOR_B + '88'],
            borderWidth: 1,
            borderRadius: 6,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: TEXT, font: { family: FONT, size: 12 } } },
          title: {
            display: true,
            text: 'Çarpışma & Adım Karşılaştırması',
            color: TEXT,
            font: { family: FONT, size: 13, weight: '600' },
          },
        },
        scales: {
          x: { ticks: { color: TEXT }, grid: { color: GRID_LINE } },
          y: {
            position: 'left',
            beginAtZero: true,
            title: { display: true, text: 'Çarpışma', color: TEXT, font: { family: FONT, size: 11 } },
            ticks: { color: TEXT },
            grid: { color: GRID_LINE },
          },
          y1: {
            position: 'right',
            beginAtZero: true,
            title: { display: true, text: 'Adım', color: TEXT, font: { family: FONT, size: 11 } },
            ticks: { color: TEXT },
            grid: { drawOnChartArea: false },
          },
        },
      },
    });
  }

  // ── Donut chart — çarpışan ajan oranı ────────────────────
  function renderDonut(canvasId, labelId, algoName, collidedCount, totalCount, color) {
    const ctx   = document.getElementById(canvasId);
    const label = document.getElementById(labelId);
    if (!ctx) return null;

    const clean = Math.max(0, totalCount - collidedCount);
    if (label) label.textContent = algoName;

    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Çarpışmalı', 'Güvenli'],
        datasets: [{
          data: [collidedCount, clean],
          backgroundColor: [color + 'bb', COLOR_DIM],
          borderColor:     [color,        'rgba(255,255,255,0.04)'],
          borderWidth: [2, 1],
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: TEXT, font: { family: FONT, size: 11 }, padding: 10, boxWidth: 10 },
          },
          title: {
            display: true,
            text: 'Ajan Durumu',
            color: TEXT,
            font: { family: FONT, size: 12, weight: '600' },
            padding: { bottom: 6 },
          },
        },
      },
    });
  }

  // ── Ana renderCharts ──────────────────────────────────────
  window.renderCharts = function () {
    const d = window._simStats;
    if (!d) return;
    destroyCharts();

    renderWinnerBanner(d);
    renderScoreCards(d);
    renderCollisionChart(d);

    const total = d.agentCount || 10;
    chartDonutA = renderDonut('chart-donut-a', 'donut-label-a', d.algoA, d.collidedA || 0, total, COLOR_A);
    chartDonutB = renderDonut('chart-donut-b', 'donut-label-b', d.algoB, d.collidedB || 0, total, COLOR_B);
  };
})();
