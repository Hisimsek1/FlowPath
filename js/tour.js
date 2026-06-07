/* tour.js — Simülasyon onboarding turu + parçacık ok animasyonu */

(function () {

  // ── Algoritma meta ────────────────────────────────────────
  const ALGO_META = {
    bfs: {
      name: 'BFS', full: 'Genişlik Öncelikli Arama',
      timeComplex: 'O(V + E)', spaceComplex: 'O(V)',
      color: '#00d4ff',
      desc: 'Başlangıçtan katman katman genişler. Tüm ajanlar aynı deterministik yolu izler — dar koridorlarda çarpışma kaçınılmaz.',
      riskLabel: 'ÇARPIŞMA RİSKİ: YÜKSEK', riskClass: 'risk-high',
    },
    dfs: {
      name: 'DFS', full: 'Derinlik Öncelikli Arama',
      timeComplex: 'O(V + E)', spaceComplex: 'O(V)',
      color: '#ff3cac',
      desc: 'Bir yönde sonuna kadar gider, çıkmaza girince geri döner. Uzun ve kaotik rotalar üretir.',
      riskLabel: 'ÇARPIŞMA RİSKİ: ÇOK YÜKSEK', riskClass: 'risk-high',
    },
    dijkstra: {
      name: 'Dijkstra', full: 'Ağırlıklı En Kısa Yol',
      timeComplex: 'O((V+E) log V)', spaceComplex: 'O(V)',
      color: '#7fff00',
      desc: 'Her hücrenin maliyetini hesaplar. Per-ajan gürültüyle ajanlar farklı rotalar seçer — daha az çakışma.',
      riskLabel: 'ÇARPIŞMA RİSKİ: DÜŞÜK', riskClass: 'risk-low',
    },
    astar: {
      name: 'A*', full: 'Sezgisel Yol Bulma',
      timeComplex: 'O((V+E) log V)', spaceComplex: 'O(V)',
      color: '#ffd700',
      desc: 'Dijkstra + Manhattan sezgiseli + per-ajan rota gürültüsü. Her ajan farklı yol seçer — minimum çarpışma.',
      riskLabel: 'ÇARPIŞMA RİSKİ: ÇOK DÜŞÜK', riskClass: 'risk-low',
    },
  };

  // ── Her adımın hedef canvas'ı ─────────────────────────────
  // adım: [hazır, ajanlar&hedefler, algoA, algoB, çarpışma]
  const STEP_TARGETS = ['sim-canvases', 'canvas-a', 'canvas-a', 'canvas-b', 'sim-canvases'];

  // ── Parçacık Ok Sistemi ───────────────────────────────────
  function createParticleArrow() {
    const canvas         = document.createElement('canvas');
    canvas.id            = 'tour-arrow-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:8999;';
    canvas.width         = window.innerWidth;
    canvas.height        = window.innerHeight;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const N   = 32;
    let phase = 'scatter';
    let rafId = null;

    const particles = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,  y: Math.random() * canvas.height,
      tx: Math.random() * canvas.width, ty: Math.random() * canvas.height,
    }));

    function buildArrow(fromX, fromY, toX, toY) {
      const dx = toX - fromX, dy = toY - fromY;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 20) return [];

      const ux = dx / len, uy = dy / len;
      const px = -uy, py = ux;
      const headW    = Math.min(26, len * 0.11);
      const shaftN   = Math.round(N * 0.62);
      const headN    = N - shaftN;
      const shaftEnd = 0.72;
      const pts      = [];

      for (let i = 0; i < shaftN; i++) {
        const t = (i / (shaftN - 1)) * shaftEnd;
        pts.push({ x: fromX + ux * len * t, y: fromY + uy * len * t });
      }

      const tipX  = toX  - ux * 6, tipY  = toY  - uy * 6;
      const baseX = fromX + ux * len * shaftEnd;
      const baseY = fromY + uy * len * shaftEnd;
      const leftN  = Math.ceil(headN / 2);
      const rightN = headN - leftN;

      for (let i = 0; i < leftN; i++) {
        const t = leftN > 1 ? i / (leftN - 1) : 0;
        pts.push({
          x: (baseX + px * headW) + t * (tipX - baseX - px * headW),
          y: (baseY + py * headW) + t * (tipY - baseY - py * headW),
        });
      }
      for (let i = 0; i < rightN; i++) {
        const t = rightN > 1 ? i / (rightN - 1) : 0;
        pts.push({
          x: (baseX - px * headW) + t * (tipX - baseX + px * headW),
          y: (baseY - py * headW) + t * (tipY - baseY + py * headW),
        });
      }

      return pts;
    }

    function scatter() {
      phase = 'scatter';
      particles.forEach(p => {
        p.tx = Math.random() * canvas.width;
        p.ty = Math.random() * canvas.height;
      });
    }

    function pointTo(targetEl) {
      const cardEl = document.getElementById('tour-card');
      if (!targetEl || !cardEl) return;

      const tRect = targetEl.getBoundingClientRect();
      const cRect = cardEl.getBoundingClientRect();

      const toX = tRect.left + tRect.width  / 2;
      const toY = tRect.top  + tRect.height / 2;

      let fromX = cRect.left + cRect.width / 2;
      let fromY = cRect.bottom + 14;

      if (toX < cRect.left - 30) {
        fromX = cRect.left - 14;
        fromY = cRect.top  + cRect.height / 2;
      } else if (toX > cRect.right + 30) {
        fromX = cRect.right + 14;
        fromY = cRect.top   + cRect.height / 2;
      } else if (toY < cRect.top - 30) {
        fromY = cRect.top - 14;
      }

      const pts = buildArrow(fromX, fromY, toX, toY);
      if (!pts.length) return;

      phase = 'form';
      particles.forEach((p, i) => {
        p.tx = pts[i % pts.length].x;
        p.ty = pts[i % pts.length].y;
      });
    }

    function update() {
      const speed = phase === 'form' ? 0.11 : 0.07;
      particles.forEach(p => {
        p.x += (p.tx - p.x) * speed;
        p.y += (p.ty - p.y) * speed;
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const maxDist  = phase === 'form' ? 34 : 80;
      const lineBase = phase === 'form' ? 0.75 : 0.12;
      const dotR     = phase === 'form' ? 3.5  : 1.6;
      const dotAlpha = phase === 'form' ? 0.95 : 0.30;
      const lw       = phase === 'form' ? 1.8  : 0.6;
      // Gri/beyaz ton — arkadan belirgin çıksın
      const lineClr  = phase === 'form' ? '210,210,210' : '160,160,160';
      const dotClr   = phase === 'form' ? '#d8d8d8'     : '#888888';

      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${lineClr},${lineBase * (1 - d / maxDist)})`;
            ctx.lineWidth   = lw;
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, dotR, 0, Math.PI * 2);
        ctx.fillStyle   = dotClr;
        ctx.globalAlpha = dotAlpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
    }

    function animate() { update(); draw(); rafId = requestAnimationFrame(animate); }
    function stop()    { if (rafId) cancelAnimationFrame(rafId); canvas.remove(); }

    animate();
    return { scatter, pointTo, stop };
  }

  // ── Adım içerikleri ────────────────────────────────────────
  function buildSteps(algos) {
    const metaA = ALGO_META[algos[0]] || ALGO_META.bfs;
    const metaB = ALGO_META[algos[1]] || ALGO_META.astar;

    return [
      {
        title: 'Simülasyon Hazır',
        html: `
          <p>Ajanlar haritaya yerleştirildi. Simülasyona başlamadan önce kısaca anlatalım.</p>
          <div class="tour-vs-badge">
            <span style="color:${metaA.color}">${metaA.name}</span>
            <span class="tour-vs-sep">vs</span>
            <span style="color:${metaB.color}">${metaB.name}</span>
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
              <span>Renkli daire — ajan</span>
            </div>
            <div class="tour-legend-item">
              <span class="tour-target-ring"></span>
              <span>Halka — hedef nokta</span>
            </div>
          </div>
          <p>Her ajan kendi rengiyle gösterilir. Aynı başlangıç/hedef pozisyonları her iki canvas'ta kullanılır — tek fark algoritma.</p>
        `,
      },
      {
        title: `${metaA.name} — ${metaA.full}`,
        html: `
          <div class="tour-badge" style="border-color:${metaA.color};color:${metaA.color}">${metaA.timeComplex} &nbsp;|&nbsp; ${metaA.spaceComplex}</div>
          <p>${metaA.desc}</p>
          <div class="tour-risk ${metaA.riskClass}">${metaA.riskLabel}</div>
        `,
      },
      {
        title: `${metaB.name} — ${metaB.full}`,
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
          <p>İki ajan aynı hücreye girerse <span class="tour-highlight-red">kırmızı patlama</span> — çarpışma sayacı artar.</p>
          <p class="tour-sub">
            <strong style="color:${metaA.color}">${metaA.name}:</strong> deterministik → ajanlar aynı koridorda yığılır.<br>
            <strong style="color:${metaB.color}">${metaB.name}:</strong> per-ajan gürültü → ajanlar doğal yayılır.
          </p>
        `,
      },
    ];
  }

  // ── Overlay DOM ───────────────────────────────────────────
  function createOverlay() {
    const el = document.createElement('div');
    el.id    = 'tour-overlay';
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

  // ── Ana tur ───────────────────────────────────────────────
  window.runTour = function (algos, onComplete) {
    const steps   = buildSteps(algos);
    const overlay = createOverlay();
    const arrow   = createParticleArrow();
    let current      = 0;
    let scatterTimer = null;

    const card    = document.getElementById('tour-card');
    const dotsEl  = document.getElementById('tour-step-dots');
    const bodyEl  = document.getElementById('tour-body');
    const nextBtn = document.getElementById('tour-next');
    const skipBtn = document.getElementById('tour-skip');

    function render() {
      const s = steps[current];
      dotsEl.innerHTML = steps.map((_, i) => {
        let cls = 'tour-dot';
        if (i === current) cls += ' active';
        else if (i < current) cls += ' done';
        return `<span class="${cls}"></span>`;
      }).join('');

      bodyEl.innerHTML = `<h3 class="tour-title">${s.title}</h3>${s.html}`;

      const isLast = current === steps.length - 1;
      nextBtn.textContent = isLast ? 'Simülasyonu Başlat ▶' : 'İleri →';
      nextBtn.classList.toggle('tour-next-last', isLast);

      card.style.animation = 'none';
      void card.offsetHeight;
      card.style.animation = 'tourCardIn 0.28s ease forwards';
    }

    // Adım değişince: dağıl → yeni hedef
    function goTo(step) {
      current = step;
      render();
      arrow.scatter();
      clearTimeout(scatterTimer);
      scatterTimer = setTimeout(() => {
        const targetEl = document.getElementById(STEP_TARGETS[step]);
        if (targetEl) arrow.pointTo(targetEl);
      }, 380);
    }

    function close(start) {
      arrow.stop();
      clearTimeout(scatterTimer);
      overlay.classList.add('tour-closing');
      setTimeout(() => {
        overlay.remove();
        if (start) onComplete();
      }, 280);
    }

    nextBtn.addEventListener('click', () => {
      if (current < steps.length - 1) goTo(current + 1);
      else close(true);
    });

    skipBtn.addEventListener('click',    () => close(true));
    document.getElementById('tour-backdrop')
            .addEventListener('click',   () => close(true));

    // İlk render + ilk ok (küçük gecikme: kart DOM'a yerleşsin)
    render();
    setTimeout(() => {
      const targetEl = document.getElementById(STEP_TARGETS[0]);
      if (targetEl) arrow.pointTo(targetEl);
    }, 220);
  };

})();
