/* simulation.js — Canvas simülasyon motoru */

(function () {

  // ── Harita tanımları (0=yol, 1=duvar) ────────────────────
  const MAPS = [
    // Harita 0 — Şehir ızgarası
    [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
      [1,0,1,1,0,0,1,0,1,1,1,0,1,0,1,0,1,0,1,1,0,0,1,0,1,1,1,0,0,1],
      [1,0,1,1,0,0,0,0,0,0,1,0,1,0,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,1],
      [1,0,0,0,0,1,1,0,1,0,0,0,1,0,1,1,0,0,1,0,0,1,1,0,1,0,0,0,0,1],
      [1,0,1,0,0,0,1,0,1,0,1,1,1,0,0,0,1,0,1,0,0,0,1,0,1,0,1,1,0,1],
      [1,0,1,1,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
      [1,0,0,0,1,0,1,1,0,1,1,0,1,1,1,1,1,0,1,1,0,1,1,0,1,1,0,1,0,1],
      [1,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
      [1,0,1,1,1,1,0,1,0,1,1,1,1,1,0,0,0,0,1,1,1,0,1,0,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1],
      [1,0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
      [1,0,0,0,1,0,0,1,0,0,0,1,0,1,1,1,1,0,1,0,0,0,1,0,1,0,0,1,0,1],
      [1,0,1,0,1,0,1,1,0,1,0,1,0,0,0,0,1,0,1,0,1,0,1,0,0,0,1,1,0,1],
      [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,1,1,0,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,0,1],
      [1,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
      [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    // Harita 1 — Labirent
    [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
      [1,0,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,1,0,1],
      [1,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,1],
      [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1,0,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
      [1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,0,1],
      [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0,1],
      [1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,0,1],
      [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,0,1],
      [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1],
      [1,1,1,0,1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1],
      [1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,0,1],
      [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1,0,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1],
      [1,1,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,1,1,1,1,1,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    // Harita 2 — Açık alan
    [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,1,0,0,0,0,1,1,1,1,1,0,0,1,0,0,0,0,0,1,1,0,0,0,1],
      [1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
      [1,0,0,1,1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
      [1,0,0,1,1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,1,0,0,1,1,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
      [1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1,0,0,0,0,1],
      [1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,0,0,1,1,0,0,0,0,0,0,1,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1],
      [1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
  ];

  const ROWS = 20;
  const COLS = 30;

  // Ağırlıklı bölgeler — Dijkstra/A* buradan kaçar, BFS bilmez
  const WEIGHT_ZONES = [
    [5, 14, 10, 20],
    [3,  8,  2,  8],
    [11, 17, 21, 27],
  ];
  const ZONE_WEIGHT = 3;

  // Ajan renk paleti (module level — önizleme için de kullanılıyor)
  const COLORS = [
    '#00d4ff','#ff6b35','#7fff00','#ff3cac','#ffd700',
    '#a78bfa','#34d399','#fb923c','#60a5fa','#f472b6',
    '#4ade80','#facc15','#38bdf8','#c084fc','#f87171',
    '#e879f9','#f97316','#22d3ee','#a3e635','#fb7185',
  ];

  // ── Canva harita PNG → grid dönüştürücü ──────────────────
  function loadMapFromImage(mapIndex, src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const tmp    = document.createElement('canvas');
        tmp.width    = COLS;
        tmp.height   = ROWS;
        const tctx   = tmp.getContext('2d');
        tctx.drawImage(img, 0, 0, COLS, ROWS);
        const px     = tctx.getImageData(0, 0, COLS, ROWS).data;
        const grid   = [];
        for (let r = 0; r < ROWS; r++) {
          const row = [];
          for (let c = 0; c < COLS; c++) {
            const i  = (r * COLS + c) * 4;
            const br = (px[i] * 0.299 + px[i+1] * 0.587 + px[i+2] * 0.114);
            row.push(br < 110 ? 1 : 0);
          }
          grid.push(row);
        }
        grid[0].fill(1); grid[ROWS-1].fill(1);
        for (let r = 0; r < ROWS; r++) { grid[r][0] = 1; grid[r][COLS-1] = 1; }
        MAPS[mapIndex] = grid;
        resolve(true);
      };
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  Promise.all([
    loadMapFromImage(0, 'assets/maps/map1.png'),
    loadMapFromImage(1, 'assets/maps/map2.png'),
    loadMapFromImage(2, 'assets/maps/map3.png'),
  ]);

  // ── Grid sınıfı ──────────────────────────────────────────
  class Grid {
    constructor(mapIndex) {
      this.rows = ROWS;
      this.cols = COLS;
      this.data = MAPS[mapIndex];
      this._buildWeights();
    }

    _buildWeights() {
      this._wts = [];
      for (let r = 0; r < ROWS; r++) {
        const row = [];
        for (let c = 0; c < COLS; c++) {
          if (this.data[r][c] === 1) { row.push(99); continue; }
          let w = 1;
          for (const [r0,r1,c0,c1] of WEIGHT_ZONES) {
            if (r >= r0 && r <= r1 && c >= c0 && c <= c1) { w = ZONE_WEIGHT; break; }
          }
          row.push(w);
        }
        this._wts.push(row);
      }
    }

    isWall(r, c) { return this.data[r][c] === 1; }
    weight(r, c) { return this._wts[r][c]; }
    isHeavy(r, c) { return this._wts[r][c] > 1 && !this.isWall(r, c); }

    randomFree(rng) {
      let r, c;
      do {
        r = 1 + Math.floor(rng() * (this.rows - 2));
        c = 1 + Math.floor(rng() * (this.cols - 2));
      } while (this.isWall(r, c));
      return [r, c];
    }
  }

  // ── Ajan sınıfı ──────────────────────────────────────────
  const TRAIL_LEN = 7;

  class Agent {
    constructor(id, start, end, color) {
      this.id         = id;
      this.pos        = [...start];
      this.end        = [...end];
      this.color      = color;
      this.path       = null;
      this.step       = 0;
      this.arrived    = false;
      this.collided   = false;
      this.flashTimer = 0;
      this.totalSteps = 0;
      this.waitCount  = 0;
      this.trail      = [];
    }

    setPath(path) { this.path = path; this.step = 0; }

    advance() {
      if (this.arrived || !this.path) return;
      this.trail.push([...this.pos]);
      if (this.trail.length > TRAIL_LEN) this.trail.shift();
      this.step++;
      this.totalSteps++;
      if (this.step >= this.path.length) {
        this.pos = [...this.end];
        this.arrived = true;
      } else {
        this.pos = [...this.path[this.step]];
      }
    }
  }

  // ── Simülasyon durumu ─────────────────────────────────────
  let simA = null, simB = null;
  let rafId = null;
  let tickInterval = null;
  let selectedMap   = 0;
  let selectedCount = 5;
  let running = false;
  let globalFrame = 0;

  function makeRng(seed) {
    let s = seed;
    return function () {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      return (s >>> 0) / 0xffffffff;
    };
  }

  // ── Simülasyon nesnesi ────────────────────────────────────
  function createSim(canvasEl, algoKey, mapIndex, agentCount) {
    const grid   = new Grid(mapIndex);
    const rng    = makeRng(42);
    const algoFn = window.Algorithms[algoKey];

    const agents = [];
    for (let i = 0; i < agentCount; i++) {
      const start = grid.randomFree(rng);
      const end   = grid.randomFree(rng);
      const agent = new Agent(i, start, end, COLORS[i % COLORS.length]);
      const path  = algoFn ? algoFn(grid, start, end, i) : null;
      agent.setPath(path || [start]);
      agents.push(agent);
    }

    return { grid, agents, algoKey, collisions: 0, tick: 0, done: false, startTime: null, endTime: null };
  }

  // ── Canvas boyutlandırma ──────────────────────────────────
  function fitCanvas(canvasEl) {
    const wrap = canvasEl.parentElement;
    const w    = wrap.clientWidth;
    if (!w) return;
    const h    = Math.round(w * (ROWS / COLS));
    canvasEl.width  = w;
    canvasEl.height = h;
    canvasEl.style.height = h + 'px';
  }

  // ── Yardımcı: yuvarlatılmış dikdörtgen ───────────────────
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ── Çizim ─────────────────────────────────────────────────
  function drawSim(canvasEl, sim) {
    const ctx = canvasEl.getContext('2d');
    const W   = canvasEl.width;
    const H   = canvasEl.height;
    const cw  = W / sim.grid.cols;
    const ch  = H / sim.grid.rows;

    ctx.clearRect(0, 0, W, H);

    // Zemin: hücreler
    for (let r = 0; r < sim.grid.rows; r++) {
      for (let c = 0; c < sim.grid.cols; c++) {
        if (sim.grid.isWall(r, c)) {
          ctx.fillStyle = '#05050e';
        } else if (sim.grid.isHeavy(r, c)) {
          ctx.fillStyle = '#070d18';
        } else {
          ctx.fillStyle = '#0b0b18';
        }
        ctx.fillRect(c * cw, r * ch, cw, ch);
      }
    }

    // Izgara çizgileri
    ctx.strokeStyle = 'rgba(0,212,255,0.06)';
    ctx.lineWidth   = 0.5;
    for (let r = 0; r <= sim.grid.rows; r++) {
      ctx.beginPath(); ctx.moveTo(0, r * ch); ctx.lineTo(W, r * ch); ctx.stroke();
    }
    for (let c = 0; c <= sim.grid.cols; c++) {
      ctx.beginPath(); ctx.moveTo(c * cw, 0); ctx.lineTo(c * cw, H); ctx.stroke();
    }

    // Hedef noktaları — pulsing ring
    const pulse = 0.5 + 0.5 * Math.sin(globalFrame * 0.08);
    sim.agents.forEach((ag) => {
      if (ag.arrived) return;
      const [er, ec] = ag.end;
      const px  = ec * cw + cw / 2;
      const py  = er * ch + ch / 2;
      const rad = Math.min(cw, ch) * 0.28;

      ctx.beginPath();
      ctx.arc(px, py, rad + pulse * rad * 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = ag.color;
      ctx.globalAlpha = 0.25 + pulse * 0.2;
      ctx.lineWidth   = 0.8;
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.arc(px, py, rad * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = ag.color;
      ctx.globalAlpha = 0.5;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Trail — iz bırakma
    sim.agents.forEach((ag) => {
      if (ag.arrived || ag.trail.length === 0) return;
      ag.trail.forEach((tpos, ti) => {
        const [tr, tc] = tpos;
        const px    = tc * cw + cw / 2;
        const py    = tr * ch + ch / 2;
        const ratio = (ti + 1) / ag.trail.length;
        const alpha = ratio * 0.28;
        const r2    = Math.min(cw, ch) * 0.18 * ratio;
        ctx.beginPath();
        ctx.arc(px, py, r2, 0, Math.PI * 2);
        ctx.fillStyle = ag.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
    });

    // Ajanlar
    sim.agents.forEach((ag) => {
      const [r, c] = ag.pos;
      const px     = c * cw + cw / 2;
      const py     = r * ch + ch / 2;
      const radius = Math.min(cw, ch) * 0.38;

      if (ag.flashTimer > 0) {
        const a = ag.flashTimer / 8;
        ctx.beginPath();
        ctx.arc(px, py, radius * 3.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,55,55,${a * 0.25})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, radius * 2.5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,80,80,${a * 0.9})`;
        ctx.lineWidth   = 1.5;
        ctx.stroke();
        ag.flashTimer--;
      }

      if (ag.arrived) {
        ctx.beginPath();
        ctx.arc(px, py, radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fill();
        return;
      }

      ctx.beginPath();
      ctx.arc(px, py, radius * 1.9, 0, Math.PI * 2);
      ctx.fillStyle = ag.color + '18';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = ag.color;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, radius * 0.32, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fill();

      if (ag.path && ag.step + 1 < ag.path.length) {
        const [nr, nc] = ag.path[Math.min(ag.step + 1, ag.path.length - 1)];
        const dr = nr - r;
        const dc = nc - c;
        const len = Math.sqrt(dr * dr + dc * dc);
        if (len > 0) {
          const nx = (dc / len) * radius * 0.95;
          const ny = (dr / len) * radius * 0.95;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + nx, py + ny);
          ctx.strokeStyle = 'rgba(0,0,0,0.6)';
          ctx.lineWidth   = 1.8;
          ctx.lineCap     = 'round';
          ctx.stroke();
        }
      }
    });

    // İstatistik overlay
    const arrived = sim.agents.filter(a => a.arrived).length;
    const oW = 164, oH = 76, ox = 8, oy = 8;

    ctx.fillStyle = 'rgba(5,5,18,0.82)';
    roundRect(ctx, ox, oy, oW, oH, 8);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0,212,255,0.18)';
    ctx.lineWidth   = 0.8;
    roundRect(ctx, ox, oy, oW, oH, 8);
    ctx.stroke();

    ctx.fillStyle   = '#555577';
    ctx.font        = '600 9px Space Grotesk, sans-serif';
    ctx.textBaseline = 'middle';
    const labels = ['ADIM', 'ÇARPIŞMA', 'ULAŞAN'];
    labels.forEach((lbl, i) => ctx.fillText(lbl, ox + 10, oy + 16 + i * 22));

    ctx.fillStyle   = '#e8e4df';
    ctx.font        = '700 12px Space Grotesk, sans-serif';
    ctx.textAlign   = 'right';
    const vals = [String(sim.tick), String(sim.collisions), `${arrived} / ${sim.agents.length}`];
    vals.forEach((v, i) => ctx.fillText(v, ox + oW - 10, oy + 16 + i * 22));
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  // ── Tek adım — COOPERATIVE PATHFINDING ───────────────────
  // Dijkstra ve A*: önde başka ajan varsa bekler (max 3 tick) → az çarpışma
  // BFS ve DFS: hiç beklemez, devam eder → çok çarpışma
  function tickSim(sim) {
    if (sim.done) return;
    sim.tick++;

    const isCooperative = (sim.algoKey === 'dijkstra' || sim.algoKey === 'astar');

    if (isCooperative) {
      // Mevcut pozisyonlar kümesi
      const occupied = new Set();
      sim.agents.forEach(ag => {
        if (!ag.arrived) occupied.add(`${ag.pos[0]},${ag.pos[1]}`);
      });

      sim.agents.forEach(ag => {
        if (ag.arrived || !ag.path) return;
        const nextIdx = ag.step + 1;

        // Hedefe ulaştıysa normal advance
        if (nextIdx >= ag.path.length) {
          ag.waitCount = 0;
          ag.advance();
          return;
        }

        const [nr, nc] = ag.path[nextIdx];
        const nk = `${nr},${nc}`;
        const forceMove = ag.waitCount >= 3;

        if (!occupied.has(nk) || forceMove) {
          ag.waitCount = 0;
          ag.advance();
        } else {
          // Bekle
          ag.waitCount++;
          ag.totalSteps++;
        }
      });
    } else {
      // BFS/DFS — beklemez, doğrudan ilerler
      sim.agents.forEach(ag => ag.advance());
    }

    // Çarpışma tespiti
    const posMap = new Map();
    sim.agents.forEach((ag) => {
      if (ag.arrived) return;
      const key = `${ag.pos[0]},${ag.pos[1]}`;
      if (!posMap.has(key)) posMap.set(key, []);
      posMap.get(key).push(ag);
    });
    posMap.forEach((group) => {
      if (group.length >= 2) {
        sim.collisions++;
        group.forEach(ag => { ag.collided = true; ag.flashTimer = 10; });
      }
    });

    if (sim.agents.every(a => a.arrived)) {
      sim.done    = true;
      sim.endTime = performance.now();
    }
  }

  // ── Animasyon döngüsü ─────────────────────────────────────
  const canvasA = document.getElementById('canvas-a');
  const canvasB = document.getElementById('canvas-b');

  function renderLoop() {
    if (!running) return;
    globalFrame++;
    if (simA) drawSim(canvasA, simA);
    if (simB) drawSim(canvasB, simB);
    rafId = requestAnimationFrame(renderLoop);
  }

  const TICK_MS = 420;

  function startTicking() {
    if (tickInterval) clearInterval(tickInterval);
    tickInterval = setInterval(() => {
      if (!running) return;
      if (simA && !simA.done) tickSim(simA);
      if (simB && !simB.done) tickSim(simB);

      const bothDone = (!simA || simA.done) && (!simB || simB.done);
      if (bothDone) { stopSim(); showStats(); }
    }, TICK_MS);
  }

  function stopSim() {
    running = false;
    clearInterval(tickInterval); tickInterval = null;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (simA && canvasA) drawSim(canvasA, simA);
    if (simB && canvasB) drawSim(canvasB, simB);
    const sb = document.getElementById('sim-start');
    const rb = document.getElementById('sim-reset');
    if (rb) rb.style.display = 'inline-flex';
    if (sb) { sb.textContent = 'Simülasyonu Başlat'; sb.disabled = false; }
  }

  // ── İstatistikleri göster ─────────────────────────────────
  function showStats() {
    const statsEl = document.getElementById('stats');
    if (!statsEl) return;
    statsEl.style.display = 'block';

    const algoA = simA ? simA.algoKey.toUpperCase() : '—';
    const algoB = simB ? simB.algoKey.toUpperCase() : '—';

    document.getElementById('stats-algo-a').textContent = algoA === 'ASTAR' ? 'A*' : algoA;
    document.getElementById('stats-algo-b').textContent = algoB === 'ASTAR' ? 'A*' : algoB;

    const stepsA   = simA ? simA.agents.reduce((s, a) => s + a.totalSteps, 0) : 0;
    const stepsB   = simB ? simB.agents.reduce((s, a) => s + a.totalSteps, 0) : 0;
    const arrivedA = simA ? simA.agents.filter(a => a.arrived).length : 0;
    const arrivedB = simB ? simB.agents.filter(a => a.arrived).length : 0;
    const durA     = simA && simA.endTime ? Math.round(simA.endTime - simA.startTime) : 0;
    const durB     = simB && simB.endTime ? Math.round(simB.endTime - simB.startTime) : 0;

    document.getElementById('stat-collision-a').textContent = simA ? simA.collisions : '—';
    document.getElementById('stat-collision-b').textContent = simB ? simB.collisions : '—';
    document.getElementById('stat-steps-a').textContent     = stepsA;
    document.getElementById('stat-steps-b').textContent     = stepsB;
    document.getElementById('stat-time-a').textContent      = durA + ' ms';
    document.getElementById('stat-time-b').textContent      = durB + ' ms';
    document.getElementById('stat-arrived-a').textContent   = `${arrivedA} / ${simA ? simA.agents.length : 0}`;
    document.getElementById('stat-arrived-b').textContent   = `${arrivedB} / ${simB ? simB.agents.length : 0}`;

    function markWinner(idA, idB, aVal, bVal, lowerIsBetter = true) {
      const elA = document.getElementById(idA);
      const elB = document.getElementById(idB);
      if (!elA || !elB) return;
      elA.classList.remove('winner', 'loser');
      elB.classList.remove('winner', 'loser');
      if (aVal === bVal) return;
      const aWins = lowerIsBetter ? aVal < bVal : aVal > bVal;
      elA.classList.add(aWins ? 'winner' : 'loser');
      elB.classList.add(aWins ? 'loser' : 'winner');
    }

    markWinner('stat-collision-a', 'stat-collision-b', simA ? simA.collisions : 0, simB ? simB.collisions : 0, true);
    markWinner('stat-steps-a',     'stat-steps-b',     stepsA, stepsB, true);
    markWinner('stat-time-a',      'stat-time-b',      durA, durB, true);
    markWinner('stat-arrived-a',   'stat-arrived-b',   arrivedA, arrivedB, false);

    statsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    window._simStats = {
      algoA:      algoA === 'ASTAR' ? 'A*' : algoA,
      algoB:      algoB === 'ASTAR' ? 'A*' : algoB,
      algoKeyA:   simA ? simA.algoKey : '',
      algoKeyB:   simB ? simB.algoKey : '',
      collisionA: simA ? simA.collisions : 0,
      collisionB: simB ? simB.collisions : 0,
      stepsA, stepsB, durA, durB,
    };
    if (typeof window.renderCharts === 'function') window.renderCharts();
  }

  // ── Önizleme: harita/ajan değişince canvas'ı göster ──────
  function drawPreviewCanvas(canvasEl, grid, agentData) {
    if (!canvasEl || !canvasEl.width) return;
    const ctx = canvasEl.getContext('2d');
    const W   = canvasEl.width;
    const H   = canvasEl.height;
    const cw  = W / grid.cols;
    const ch  = H / grid.rows;

    ctx.clearRect(0, 0, W, H);

    // Zemin
    for (let r = 0; r < grid.rows; r++) {
      for (let c = 0; c < grid.cols; c++) {
        if (grid.isWall(r, c)) ctx.fillStyle = '#05050e';
        else if (grid.isHeavy(r, c)) ctx.fillStyle = '#070d18';
        else ctx.fillStyle = '#0b0b18';
        ctx.fillRect(c * cw, r * ch, cw, ch);
      }
    }

    // Izgara
    ctx.strokeStyle = 'rgba(0,212,255,0.05)';
    ctx.lineWidth   = 0.5;
    for (let r = 0; r <= grid.rows; r++) {
      ctx.beginPath(); ctx.moveTo(0, r * ch); ctx.lineTo(W, r * ch); ctx.stroke();
    }
    for (let c = 0; c <= grid.cols; c++) {
      ctx.beginPath(); ctx.moveTo(c * cw, 0); ctx.lineTo(c * cw, H); ctx.stroke();
    }

    // Hedefler ve ajanlar
    agentData.forEach(({ start, end, color }) => {
      // Hedef halkası
      const [er, ec] = end;
      const epx = ec * cw + cw / 2;
      const epy = er * ch + ch / 2;
      ctx.beginPath();
      ctx.arc(epx, epy, Math.min(cw, ch) * 0.3, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth   = 0.8;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Ajan noktası
      const [ar, ac] = start;
      const px = ac * cw + cw / 2;
      const py = ar * ch + ch / 2;
      const radius = Math.min(cw, ch) * 0.35;

      ctx.beginPath();
      ctx.arc(px, py, radius * 1.7, 0, Math.PI * 2);
      ctx.fillStyle = color + '12';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.65;
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.arc(px, py, radius * 0.32, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fill();
    });
  }

  function drawPreview() {
    if (!canvasA || !canvasB) return;
    fitCanvas(canvasA);
    fitCanvas(canvasB);
    if (!canvasA.width) return;

    // Etiketleri güncelle
    const algos = window.selectedAlgorithms;
    const names = { bfs:'BFS', dfs:'DFS', dijkstra:'Dijkstra', astar:'A*' };
    const labelA = document.getElementById('canvas-label-a');
    const labelB = document.getElementById('canvas-label-b');
    if (algos && algos.length >= 2) {
      if (labelA) labelA.textContent = names[algos[0]] || algos[0];
      if (labelB) labelB.textContent = names[algos[1]] || algos[1];
    }

    // Simülasyonla aynı seed → aynı başlangıç/hedef pozisyonları
    const grid = new Grid(selectedMap);
    const rng  = makeRng(42);
    const agentData = [];
    for (let i = 0; i < selectedCount; i++) {
      const start = grid.randomFree(rng);
      const end   = grid.randomFree(rng);
      agentData.push({ start, end, color: COLORS[i % COLORS.length] });
    }

    drawPreviewCanvas(canvasA, grid, agentData);
    drawPreviewCanvas(canvasB, grid, agentData);
  }

  // Dışarıdan çağrılabilir (algo-select.js "Simülasyona Geç" butonunda)
  window.drawSimPreview = drawPreview;

  // ── UI kontrolü ───────────────────────────────────────────
  document.querySelectorAll('.map-option').forEach((el) => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.map-option').forEach(e => e.classList.remove('selected'));
      el.classList.add('selected');
      selectedMap = +el.dataset.map;
      if (!running) drawPreview();
    });
  });

  document.querySelectorAll('.agent-btn').forEach((el) => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.agent-btn').forEach(e => e.classList.remove('selected'));
      el.classList.add('selected');
      selectedCount = +el.dataset.count;
      if (!running) drawPreview();
    });
  });

  const startBtn = document.getElementById('sim-start');
  const resetBtn = document.getElementById('sim-reset');

  startBtn && startBtn.addEventListener('click', () => {
    const algos = window.selectedAlgorithms || ['bfs', 'astar'];
    if (algos.length < 2) {
      alert('Önce Algoritma Seçimi bölümünden iki algoritma seç!');
      return;
    }

    fitCanvas(canvasA);
    fitCanvas(canvasB);

    const labelA = document.getElementById('canvas-label-a');
    const labelB = document.getElementById('canvas-label-b');
    const names  = { bfs:'BFS', dfs:'DFS', dijkstra:'Dijkstra', astar:'A*' };
    if (labelA) labelA.textContent = names[algos[0]] || algos[0];
    if (labelB) labelB.textContent = names[algos[1]] || algos[1];

    simA = createSim(canvasA, algos[0], selectedMap, selectedCount);
    simB = createSim(canvasB, algos[1], selectedMap, selectedCount);

    // İlk kareyi çiz (tur sırasında görünür olsun)
    drawSim(canvasA, simA);
    drawSim(canvasB, simB);

    const statsEl = document.getElementById('stats');
    if (statsEl) statsEl.style.display = 'none';

    resetBtn.style.display = 'inline-flex';
    startBtn.textContent   = 'Çalışıyor...';
    startBtn.disabled      = true;

    const doStart = () => {
      simA.startTime = performance.now();
      simB.startTime = performance.now();
      running = true;
      renderLoop();
      startTicking();
    };

    // Tur varsa önce tur, sonra başlat
    if (typeof window.runTour === 'function') {
      window.runTour(algos, doStart);
    } else {
      doStart();
    }
  });

  resetBtn && resetBtn.addEventListener('click', () => {
    stopSim();
    simA = null; simB = null;
    running = false;
    globalFrame = 0;

    [canvasA, canvasB].forEach(c => {
      if (c) { const ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height); }
    });

    resetBtn.style.display = 'none';
    startBtn.textContent   = 'Simülasyonu Başlat';
    startBtn.disabled      = false;

    const statsEl = document.getElementById('stats');
    if (statsEl) statsEl.style.display = 'none';

    // Sıfırlanınca önizleme geri gelir
    drawPreview();
  });

  window.addEventListener('resize', () => {
    if (running) {
      if (simA) { fitCanvas(canvasA); }
      if (simB) { fitCanvas(canvasB); }
    } else {
      drawPreview();
    }
  });

})();
