/* simulation.js — Three.js 3D simülasyon motoru */

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

  // [row_start, row_end, col_start, col_end, weight] — backend/app.py WEIGHT_ZONES ile birebir
  const WEIGHT_ZONES = [
    [5, 14, 10, 20, 3],
    [3,  8,  3,  8, 2],
    [12, 17, 20, 27, 2],
  ];

  // Hue wheel'de çapraz dağılım: ardışık iki ajan hiçbir zaman benzer renk almaz
  const COLORS = [
    '#ff2222', // 0  kırmızı
    '#00e5ff', // 1  cyan        (180° fark)
    '#ffdd00', // 2  sarı        (90°)
    '#aa00ff', // 3  mor         (270°)
    '#00ff77', // 4  nane        (135°)
    '#ff6600', // 5  turuncu     (45°)
    '#0055ff', // 6  kobalt mavi (225°)
    '#ff0099', // 7  magenta     (315°)
    '#88ff00', // 8  lime        (112°)
    '#6633ff', // 9  indigo      (247°)
    '#00ddaa', // 10 teal        (157°)
    '#ff5500', // 11 mercan      (22°)
    '#22aaff', // 12 gökyüzü     (202°)
    '#dd00ee', // 13 violet      (292°)
    '#aaff22', // 14 sarı-yeşil  (78°)
    '#ff3377', // 15 gül         (337°)
    '#00ffcc', // 16 turkuaz     (165°)
    '#ff8800', // 17 amber       (33°)
    '#4400ff', // 18 ultramavi   (258°)
    '#44ff66', // 19 açık yeşil  (135°+)
  ];

  // ── Canva harita PNG → grid ───────────────────────────────
  function loadMapFromImage(mapIndex, src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const tmp = document.createElement('canvas');
        tmp.width = COLS; tmp.height = ROWS;
        const tctx = tmp.getContext('2d');
        tctx.drawImage(img, 0, 0, COLS, ROWS);
        const px = tctx.getImageData(0, 0, COLS, ROWS).data;
        const grid = [];
        for (let r = 0; r < ROWS; r++) {
          const row = [];
          for (let c = 0; c < COLS; c++) {
            const i = (r * COLS + c) * 4;
            const br = px[i]*0.299 + px[i+1]*0.587 + px[i+2]*0.114;
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
          for (const [r0,r1,c0,c1,ww] of WEIGHT_ZONES) {
            if (r >= r0 && r <= r1 && c >= c0 && c <= c1) { w = ww; break; }
          }
          row.push(w);
        }
        this._wts.push(row);
      }
    }
    isWall(r, c) { return this.data[r][c] === 1; }
    weight(r, c)  { return this._wts[r][c]; }
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
  const TRAIL_LEN = 8;
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

  // ── RNG ──────────────────────────────────────────────────
  function makeRng(seed) {
    let s = seed;
    return function () {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      return (s >>> 0) / 0xffffffff;
    };
  }

  // ── Backend yardımcı fonksiyonu ───────────────────────────
  async function fetchPaths(algoKey, mapIndex, agentCount) {
    const res = await fetch('http://localhost:5000/api/simulate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ algorithm: algoKey, map: mapIndex, agents: agentCount, seed: 42 }),
    });
    if (!res.ok) throw new Error(`Backend ${res.status}`);
    return res.json();
  }

  // ── Simülasyon nesnesi ────────────────────────────────────
  // precomputedPaths: backend'den gelen [[r,c],...] dizileri (null ise local algoritma çalışır)
  function createSim(canvasEl, algoKey, mapIndex, agentCount, precomputedPaths = null) {
    const grid   = new Grid(mapIndex);
    const rng    = makeRng(42);
    const algoFn = window.Algorithms[algoKey];
    const agents = [];
    for (let i = 0; i < agentCount; i++) {
      const start = grid.randomFree(rng);
      const end   = grid.randomFree(rng);
      const agent = new Agent(i, start, end, COLORS[i % COLORS.length]);
      const path  = precomputedPaths
        ? precomputedPaths[i]
        : (algoFn ? algoFn(grid, start, end, i) : null);
      agent.setPath(path || [start]);
      agents.push(agent);
    }
    return { grid, agents, algoKey, collisions: 0, tick: 0, done: false, startTime: null, endTime: null };
  }

  // ── Three.js 3D Renderer ──────────────────────────────────
  class ThreeSimRenderer {
    constructor(canvasEl, hudId) {
      this.canvas   = canvasEl;
      this.hudId    = hudId; // 'a' veya 'b'
      this.scene    = null;
      this.camera   = null;
      this.renderer = null;
      this.controls = null;
      this.sceneObjects = []; // haritalanabilir nesneler (clearScene'de silinir)
      this.agentMeshes  = new Map();
      this.targetMeshes = new Map();
      this.trailLines   = new Map();
      this.initialized  = false;
    }

    init() {
      const wrap = this.canvas.parentElement;
      const w    = (wrap ? (wrap.clientWidth || wrap.offsetWidth) : 0) || 640;
      const h    = Math.round(w * (ROWS / COLS));
      this.canvas.width  = w;
      this.canvas.height = h;
      this.canvas.style.height = h + 'px';

      // Renderer
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        powerPreference: 'high-performance',
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setSize(w, h);
      this.renderer.shadowMap.enabled = false;

      // Scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x080818);
      this.scene.fog = new THREE.FogExp2(0x080818, 0.012);

      // Camera — perspektif, yukarıdan diagonal
      this.camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 300);
      this.camera.position.set(COLS * 0.55, ROWS * 0.85, ROWS * 0.70);
      this.camera.lookAt(0, 0, 0);

      // OrbitControls — mouse ile döndür/yaklaş
      this.controls = new THREE.OrbitControls(this.camera, this.canvas);
      this.controls.enableDamping    = true;
      this.controls.dampingFactor    = 0.07;
      this.controls.minDistance      = 6;
      this.controls.maxDistance      = 90;
      this.controls.maxPolarAngle    = Math.PI / 2.1;
      this.controls.target.set(0, 0, 0);
      this.controls.update();

      // Işıklandırma — nötr beyaz, güçlü
      const ambient = new THREE.AmbientLight(0xffffff, 2.2);
      this.scene.add(ambient);

      const sun = new THREE.DirectionalLight(0xffffff, 3.0);
      sun.position.set(COLS * 0.5, 40, ROWS * 0.4);
      this.scene.add(sun);

      const fill = new THREE.DirectionalLight(0xaaccff, 1.5);
      fill.position.set(-COLS * 0.5, 20, -ROWS * 0.5);
      this.scene.add(fill);

      const hemi = new THREE.HemisphereLight(0x8899cc, 0x050812, 1.2);
      this.scene.add(hemi);

      this.initialized = true;
    }

    // grid koordinatı → 3D dünya pozisyonu (merkez = 0,0,0)
    _toWorld(r, c) {
      return new THREE.Vector3(
        c - COLS / 2 + 0.5,
        0,
        r - ROWS / 2 + 0.5
      );
    }

    // Among Us karakteri — oyuna benzer bean şekli, büyük vizör
    _createAmongusAgent(hexColor, opacity) {
      const op  = opacity === undefined ? 1.0 : opacity;
      const c   = new THREE.Color(hexColor);
      const grp = new THREE.Group();

      const bodyMat = new THREE.MeshStandardMaterial({
        color: c, emissive: c, emissiveIntensity: 0.55,
        roughness: 0.22, metalness: 0.60,
        transparent: op < 1, opacity: op,
      });

      // Ana gövde — yassı yumurta/bean şekli, daha büyük
      const bodyGeo = new THREE.SphereGeometry(0.34, 20, 16);
      const body    = new THREE.Mesh(bodyGeo, bodyMat);
      body.scale.set(0.82, 1.40, 0.75);
      body.position.y = 0.28;
      grp.add(body);

      // Kafa — gövdeyle birleşik, üste yuvarlak
      const headGeo = new THREE.SphereGeometry(0.30, 18, 14);
      const head    = new THREE.Mesh(headGeo, bodyMat);
      head.scale.set(0.98, 0.85, 0.80);
      head.position.set(0.04, 0.62, 0);
      grp.add(head);

      // Vizör — Among Us'taki gibi büyük, yuvarlak, parlak cam
      const visorMat = new THREE.MeshStandardMaterial({
        color: 0xe0f8ff,
        emissive: 0x66eeff,
        emissiveIntensity: 1.6,
        roughness: 0.01,
        metalness: 0.05,
        transparent: true,
        opacity: op < 1 ? op * 0.75 : 0.88,
      });
      const visorGeo = new THREE.SphereGeometry( 0.22, 16, 12);
      const visor    = new THREE.Mesh(visorGeo, visorMat);
      visor.scale.set(1.10, 0.68, 0.32);
      visor.position.set(0.20, 0.65, 0.24);
      grp.add(visor);

      // Vizör yansıma noktası (beyaz parlama)
      const glintMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2.0,
        transparent: true, opacity: op < 1 ? op * 0.5 : 0.55,
      });
      const glintGeo = new THREE.SphereGeometry(0.06, 8, 6);
      const glint    = new THREE.Mesh(glintGeo, glintMat);
      glint.position.set(0.26, 0.70, 0.28);
      grp.add(glint);

      // Sırt çantası — daha büyük, belirgin
      const packMat = new THREE.MeshStandardMaterial({
        color: c.clone().multiplyScalar(0.55),
        roughness: 0.70, metalness: 0.18,
        transparent: op < 1, opacity: op,
      });
      const packGeo = new THREE.BoxGeometry(0.22, 0.30, 0.16);
      const pack    = new THREE.Mesh(packGeo, packMat);
      pack.position.set(-0.04, 0.28, -0.30);
      grp.add(pack);

      // Sırt çantası tüp detayı
      const tubeMat = new THREE.MeshStandardMaterial({
        color: c.clone().multiplyScalar(0.40), roughness: 0.6,
        transparent: op < 1, opacity: op,
      });
      const tubeGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.12, 8);
      const tube    = new THREE.Mesh(tubeGeo, tubeMat);
      tube.position.set(-0.04, 0.42, -0.32);
      grp.add(tube);

      // Ayaklar — daha kalın
      const legMat = new THREE.MeshStandardMaterial({
        color: c.clone().multiplyScalar(0.52),
        roughness: 0.7, metalness: 0.1,
        transparent: op < 1, opacity: op,
      });
      const legGeo = new THREE.CylinderGeometry(0.082, 0.090, 0.16, 10);
      [-0.13, 0.13].forEach(xOff => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(xOff, 0.02, 0.05);
        grp.add(leg);
      });

      grp._bodyMat  = bodyMat;
      grp._visorMat = visorMat;
      return grp;
    }

    buildMap(grid) {
      // Zemin — çok koyu, duvarlarla maksimum kontrast
      const floorGeo = new THREE.PlaneGeometry(COLS, ROWS);
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0x050810, roughness: 0.95, metalness: 0.0,
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -0.02;
      this.scene.add(floor);
      this.sceneObjects.push(floor);

      // Grid çizgisi — cyan, açıkça görünür
      const gh = new THREE.GridHelper(
        Math.max(COLS, ROWS), Math.max(COLS, ROWS),
        0x1a4060, 0x1a4060
      );
      gh.position.y = 0.01;
      this.scene.add(gh);
      this.sceneObjects.push(gh);

      // Duvarlar — InstancedMesh (tek draw call, performanslı)
      const wallList = [];
      for (let r = 0; r < grid.rows; r++) {
        for (let c = 0; c < grid.cols; c++) {
          if (grid.isWall(r, c)) wallList.push([r, c]);
        }
      }

      // Duvar ana mesh — açık mavi-gri, net görünür
      const wallGeo = new THREE.BoxGeometry(0.94, 2.2, 0.94);
      const wallMat = new THREE.MeshStandardMaterial({
        color: 0x4a5880, roughness: 0.50, metalness: 0.45,
        emissive: 0x1e2a48, emissiveIntensity: 0.35,
      });
      const walls = new THREE.InstancedMesh(wallGeo, wallMat, wallList.length);
      const dummy = new THREE.Object3D();
      wallList.forEach(([r, c], i) => {
        const wp = this._toWorld(r, c);
        dummy.position.set(wp.x, 1.1, wp.z);
        dummy.updateMatrix();
        walls.setMatrixAt(i, dummy.matrix);
      });
      walls.instanceMatrix.needsUpdate = true;
      this.scene.add(walls);
      this.sceneObjects.push(walls);

      // Duvar kenar çizgileri — cyan parlama efekti
      const edgeGeo = new THREE.EdgesGeometry(wallGeo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: 0x2a5faa,
        transparent: true,
        opacity: 0.55,
      });
      wallList.forEach(([r, c]) => {
        const wp   = this._toWorld(r, c);
        const edge = new THREE.LineSegments(edgeGeo, edgeMat);
        edge.position.set(wp.x, 1.1, wp.z);
        this.scene.add(edge);
        this.sceneObjects.push(edge);
      });
    }

    setupAgents(agents) {
      agents.forEach(ag => {
        const color = new THREE.Color(ag.color);

        // Among Us karakteri
        const grp = this._createAmongusAgent(ag.color, 1.0);
        const wp  = this._toWorld(ag.pos[0], ag.pos[1]);
        grp.position.set(wp.x, 0, wp.z);
        grp._prevPos = grp.position.clone();
        this.scene.add(grp);
        this.sceneObjects.push(grp);
        this.agentMeshes.set(ag.id, grp);

        // Hedef halkası — yerde yassı torus
        const ringGeo = new THREE.TorusGeometry(0.34, 0.055, 6, 28);
        const ringMat = new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.8,
          transparent: true,
          opacity: 0.85,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        const tp   = this._toWorld(ag.end[0], ag.end[1]);
        ring.position.set(tp.x, 0.07, tp.z);
        ring.rotation.x = -Math.PI / 2;
        this.scene.add(ring);
        this.sceneObjects.push(ring);
        this.targetMeshes.set(ag.id, ring);

        // Trail çizgisi
        const trailGeo = new THREE.BufferGeometry();
        const trailMat = new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: 0.35,
        });
        const line = new THREE.Line(trailGeo, trailMat);
        this.scene.add(line);
        this.sceneObjects.push(line);
        this.trailLines.set(ag.id, line);
      });
    }

    showPreview(agentData) {
      agentData.forEach((data, i) => {
        const color = new THREE.Color(data.color);

        // Yarı saydam Among Us karakteri
        const grp = this._createAmongusAgent(data.color, 0.55);
        const wp  = this._toWorld(data.start[0], data.start[1]);
        grp.position.set(wp.x, 0, wp.z);
        this.scene.add(grp);
        this.sceneObjects.push(grp);
        this.agentMeshes.set(-i - 1, grp);

        // Hedef halkası
        const ringGeo = new THREE.TorusGeometry(0.30, 0.045, 6, 24);
        const ringMat = new THREE.MeshStandardMaterial({
          color, emissive: color, emissiveIntensity: 0.6,
          transparent: true, opacity: 0.45,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        const tp   = this._toWorld(data.end[0], data.end[1]);
        ring.position.set(tp.x, 0.06, tp.z);
        ring.rotation.x = -Math.PI / 2;
        this.scene.add(ring);
        this.sceneObjects.push(ring);
        this.targetMeshes.set(-i - 1, ring);
      });
    }

    update(sim, frame) {
      if (!this.initialized || !sim) return;

      this.controls.update();
      const time = frame * 0.04;

      sim.agents.forEach(ag => {
        const mesh  = this.agentMeshes.get(ag.id);
        const ring  = this.targetMeshes.get(ag.id);
        const trail = this.trailLines.get(ag.id);
        if (!mesh) return;

        // Ajan pozisyonu — smooth lerp
        const wp     = this._toWorld(ag.pos[0], ag.pos[1]);
        const target = new THREE.Vector3(wp.x, 0.05, wp.z);
        mesh.position.lerp(target, 0.22);

        // Hareket yönüne döndür (Among Us yürüme efekti)
        if (mesh._prevPos) {
          const dx = mesh.position.x - mesh._prevPos.x;
          const dz = mesh.position.z - mesh._prevPos.z;
          if (Math.abs(dx) + Math.abs(dz) > 0.005) {
            mesh.rotation.y = Math.atan2(dx, dz);
          }
        }
        if (!mesh._prevPos) mesh._prevPos = new THREE.Vector3();
        mesh._prevPos.copy(mesh.position);

        // Yürüme bobbing animasyonu
        if (!ag.arrived && !ag.flashTimer) {
          mesh.position.y = Math.sin(time * 6 + ag.id * 1.3) * 0.028;
        }

        // Çarpışma flash — tüm body malzemeleri kırmızı
        if (ag.flashTimer > 0) {
          if (mesh._bodyMat) {
            mesh._bodyMat.emissive.setHex(0xff1111);
            mesh._bodyMat.emissiveIntensity = 1.1;
          }
          mesh.scale.setScalar(1.0 + (ag.flashTimer / 10) * 0.38);
          mesh.position.y = (ag.flashTimer / 10) * 0.18;
        } else if (ag.arrived) {
          if (mesh._bodyMat) {
            mesh._bodyMat.emissive.set(ag.color);
            mesh._bodyMat.emissiveIntensity = 0.04;
            mesh._bodyMat.opacity = 0.38;
            mesh._bodyMat.transparent = true;
          }
          mesh.scale.setScalar(0.6);
          mesh.position.y = 0;
        } else {
          if (mesh._bodyMat) {
            mesh._bodyMat.emissive.set(ag.color);
            mesh._bodyMat.emissiveIntensity = 0.18;
          }
          mesh.scale.setScalar(1.0);
        }

        // Hedef halka — pulsing
        if (ring) {
          if (ag.arrived) {
            ring.visible = false;
          } else {
            const pulse = 1.0 + Math.sin(time + ag.id * 0.8) * 0.10;
            ring.scale.setScalar(pulse);
          }
        }

        // Trail güncelle
        if (trail && ag.trail.length > 1) {
          const pts = ag.trail.map(([tr, tc]) => {
            const p = this._toWorld(tr, tc);
            return new THREE.Vector3(p.x, 0.06, p.z);
          });
          pts.push(new THREE.Vector3(mesh.position.x, 0.06, mesh.position.z));
          trail.geometry.setFromPoints(pts);
        }
      });

      // HUD güncelle
      const arrived = sim.agents.filter(a => a.arrived).length;
      const tick    = document.getElementById(`hud-${this.hudId}-tick`);
      const coll    = document.getElementById(`hud-${this.hudId}-coll`);
      const arr     = document.getElementById(`hud-${this.hudId}-arr`);
      if (tick) tick.textContent = sim.tick;
      if (coll) coll.textContent = sim.collisions;
      if (arr)  arr.textContent  = `${arrived}/${sim.agents.length}`;

      this.renderer.render(this.scene, this.camera);
    }

    resize() {
      const wrap = this.canvas.parentElement;
      if (!wrap) return;
      const w = wrap.clientWidth || wrap.offsetWidth || 640;
      if (!w) return;
      const h = Math.round(w * (ROWS / COLS));
      this.canvas.width  = w;
      this.canvas.height = h;
      this.canvas.style.height = h + 'px';
      if (this.renderer) this.renderer.setSize(w, h);
      if (this.camera) {
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
      }
    }

    clearScene() {
      this.sceneObjects.forEach(obj => {
        this.scene.remove(obj);
        if (obj.isGroup) {
          obj.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
          });
        } else {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material.dispose();
          }
        }
      });
      this.sceneObjects = [];
      this.agentMeshes.clear();
      this.targetMeshes.clear();
      this.trailLines.clear();
    }

    dispose() {
      this.clearScene();
      if (this.controls) this.controls.dispose();
      if (this.renderer) this.renderer.dispose();
      this.initialized = false;
    }
  }

  // ── Simülasyon durumu ─────────────────────────────────────
  let simA = null, simB = null;
  let rendererA = null, rendererB = null;
  let previewRafId = null;
  let rafId = null;
  let tickInterval = null;
  let selectedMap   = 0;
  let selectedCount = 5;
  let running = false;
  let globalFrame = 0;

  const canvasA = document.getElementById('canvas-a');
  const canvasB = document.getElementById('canvas-b');

  // ── Renderer başlat ──────────────────────────────────────
  function initRenderers() {
    if (!rendererA) {
      rendererA = new ThreeSimRenderer(canvasA, 'a');
      rendererA.init();
    }
    if (!rendererB) {
      rendererB = new ThreeSimRenderer(canvasB, 'b');
      rendererB.init();
    }
  }

  // ── Preview döngüsü — orbit kontrolleri çalışsın ─────────
  function startPreviewLoop() {
    if (previewRafId) cancelAnimationFrame(previewRafId);
    let resizeChecked = false;
    function loop() {
      if (running) { previewRafId = null; return; }
      // İlk birkaç frame'de canvas boyutu sıfır olabilir — resize ile düzelt
      if (!resizeChecked) {
        if (rendererA) rendererA.resize();
        if (rendererB) rendererB.resize();
        resizeChecked = true;
      }
      if (rendererA && rendererA.initialized) {
        rendererA.controls.update();
        rendererA.renderer.render(rendererA.scene, rendererA.camera);
      }
      if (rendererB && rendererB.initialized) {
        rendererB.controls.update();
        rendererB.renderer.render(rendererB.scene, rendererB.camera);
      }
      previewRafId = requestAnimationFrame(loop);
    }
    loop();
  }

  // ── Preview ──────────────────────────────────────────────
  function drawPreview() {
    initRenderers();
    // Layout tam oturmuşsa doğrudan çiz; değilse bir sonraki frame'de resize'la
    rendererA.resize();
    rendererB.resize();

    const algos = window.selectedAlgorithms;
    const names = { bfs:'BFS', dfs:'DFS', dijkstra:'Dijkstra', astar:'A*' };
    const labelA = document.getElementById('canvas-label-a');
    const labelB = document.getElementById('canvas-label-b');
    if (algos && algos.length >= 2) {
      if (labelA) labelA.textContent = names[algos[0]] || algos[0];
      if (labelB) labelB.textContent = names[algos[1]] || algos[1];
    }

    const grid = new Grid(selectedMap);
    const rng  = makeRng(42);
    const agentData = [];
    for (let i = 0; i < selectedCount; i++) {
      agentData.push({
        start: grid.randomFree(rng),
        end:   grid.randomFree(rng),
        color: COLORS[i % COLORS.length],
      });
    }

    rendererA.clearScene();
    rendererB.clearScene();
    rendererA.buildMap(new Grid(selectedMap));
    rendererB.buildMap(new Grid(selectedMap));
    rendererA.showPreview(agentData);
    rendererB.showPreview(agentData);
    startPreviewLoop();

    // Sayfa layout gecikmesini tolere etmek için 200ms sonra da resize
    setTimeout(() => {
      rendererA.resize();
      rendererB.resize();
    }, 200);
  }
  window.drawSimPreview = drawPreview;

  // ── Tick — tüm ajanlar ilerler ────────────────────────────
  function tickSim(sim) {
    if (sim.done) return;
    sim.tick++;
    sim.agents.forEach(ag => ag.advance());

    // Çarpışma tespiti
    const posMap = new Map();
    sim.agents.forEach(ag => {
      if (ag.arrived) return;
      const key = `${ag.pos[0]},${ag.pos[1]}`;
      if (!posMap.has(key)) posMap.set(key, []);
      posMap.get(key).push(ag);
    });
    posMap.forEach(group => {
      if (group.length >= 2) {
        sim.collisions++;
        group.forEach(ag => { ag.collided = true; ag.flashTimer = 10; });
      }
    });

    // flashTimer azalt — her tick'te bir adım düşer, 0'da efekt söner
    sim.agents.forEach(ag => {
      if (ag.flashTimer > 0) ag.flashTimer--;
    });

    if (sim.agents.every(a => a.arrived)) {
      sim.done    = true;
      sim.endTime = performance.now();
    }
  }

  // ── Animasyon döngüsü ─────────────────────────────────────
  function renderLoop() {
    if (!running) return;
    globalFrame++;
    if (rendererA && simA) rendererA.update(simA, globalFrame);
    if (rendererB && simB) rendererB.update(simB, globalFrame);
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
    // Son kareyi render et
    if (rendererA && simA) rendererA.update(simA, globalFrame);
    if (rendererB && simB) rendererB.update(simB, globalFrame);
    const sb = document.getElementById('sim-start');
    const rb = document.getElementById('sim-reset');
    if (rb) rb.style.display = 'inline-flex';
    if (sb) { sb.textContent = 'Simülasyonu Başlat'; sb.disabled = false; }
    // Orbit kontrolü hâlâ çalışsın
    startPreviewLoop();
  }

  // ── İstatistikler ─────────────────────────────────────────
  function showStats() {
    const statsEl = document.getElementById('stats');
    if (!statsEl) return;
    statsEl.style.display = 'block';

    const algoA = simA ? simA.algoKey.toUpperCase() : '—';
    const algoB = simB ? simB.algoKey.toUpperCase() : '—';

    document.getElementById('stats-algo-a').textContent = algoA === 'ASTAR' ? 'A*' : algoA;
    document.getElementById('stats-algo-b').textContent = algoB === 'ASTAR' ? 'A*' : algoB;

    const stepsA    = simA ? simA.agents.reduce((s, a) => s + a.totalSteps, 0) : 0;
    const stepsB    = simB ? simB.agents.reduce((s, a) => s + a.totalSteps, 0) : 0;
    const arrivedA  = simA ? simA.agents.filter(a => a.arrived).length : 0;
    const arrivedB  = simB ? simB.agents.filter(a => a.arrived).length : 0;
    const durA      = simA && simA.endTime ? Math.round(simA.endTime - simA.startTime) : 0;
    const durB      = simB && simB.endTime ? Math.round(simB.endTime - simB.startTime) : 0;
    const collidedA = simA ? simA.agents.filter(a => a.collided).length : 0;
    const collidedB = simB ? simB.agents.filter(a => a.collided).length : 0;

    document.getElementById('stat-collision-a').textContent = simA ? simA.collisions : '—';
    document.getElementById('stat-collision-b').textContent = simB ? simB.collisions : '—';
    document.getElementById('stat-steps-a').textContent     = stepsA;
    document.getElementById('stat-steps-b').textContent     = stepsB;
    document.getElementById('stat-time-a').textContent      = durA + ' ms';
    document.getElementById('stat-time-b').textContent      = durB + ' ms';
    document.getElementById('stat-arrived-a').textContent   = `${arrivedA}/${simA ? simA.agents.length : 0}`;
    document.getElementById('stat-arrived-b').textContent   = `${arrivedB}/${simB ? simB.agents.length : 0}`;

    function markWinner(idA, idB, aVal, bVal, lowerIsBetter) {
      const elA = document.getElementById(idA);
      const elB = document.getElementById(idB);
      if (!elA || !elB) return;
      elA.classList.remove('winner', 'loser');
      elB.classList.remove('winner', 'loser');
      if (aVal === bVal) return;
      const aWins = lowerIsBetter ? aVal < bVal : aVal > bVal;
      elA.classList.add(aWins ? 'winner' : 'loser');
      elB.classList.add(aWins ? 'loser'  : 'winner');
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
      collidedA, collidedB,
      agentCount: selectedCount,
      stepsA, stepsB, durA, durB,
    };
    if (typeof window.renderCharts === 'function') window.renderCharts();
  }

  // ── UI olay dinleyicileri ─────────────────────────────────
  document.querySelectorAll('.map-option').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.map-option').forEach(e => e.classList.remove('selected'));
      el.classList.add('selected');
      selectedMap = +el.dataset.map;
      if (!running) drawPreview();
    });
  });

  document.querySelectorAll('.agent-btn').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.agent-btn').forEach(e => e.classList.remove('selected'));
      el.classList.add('selected');
      selectedCount = +el.dataset.count;
      if (!running) drawPreview();
    });
  });

  const startBtn = document.getElementById('sim-start');
  const resetBtn = document.getElementById('sim-reset');

  startBtn && startBtn.addEventListener('click', async () => {
    const algos = window.selectedAlgorithms || ['bfs', 'astar'];
    if (algos.length < 2) {
      alert('Önce Algoritma Seçimi bölümünden iki algoritma seç!');
      return;
    }

    // Backend'den path'leri al (yoksa local algoritma fallback)
    startBtn.textContent = 'Hesaplanıyor...';
    startBtn.disabled    = true;

    let pathsA = null, pathsB = null;
    try {
      const [dataA, dataB] = await Promise.all([
        fetchPaths(algos[0], selectedMap, selectedCount),
        fetchPaths(algos[1], selectedMap, selectedCount),
      ]);
      pathsA = dataA.paths;
      pathsB = dataB.paths;
    } catch (e) {
      console.warn('Backend bağlantısı yok, local algoritma kullanılıyor:', e.message);
    }

    try {
      initRenderers();
      rendererA.resize();
      rendererB.resize();

      const labelA = document.getElementById('canvas-label-a');
      const labelB = document.getElementById('canvas-label-b');
      const names  = { bfs:'BFS', dfs:'DFS', dijkstra:'Dijkstra', astar:'A*' };
      if (labelA) labelA.textContent = names[algos[0]] || algos[0];
      if (labelB) labelB.textContent = names[algos[1]] || algos[1];

      simA = createSim(canvasA, algos[0], selectedMap, selectedCount, pathsA);
      simB = createSim(canvasB, algos[1], selectedMap, selectedCount, pathsB);

      rendererA.clearScene();
      rendererB.clearScene();
      rendererA.buildMap(simA.grid);
      rendererB.buildMap(simB.grid);
      rendererA.setupAgents(simA.agents);
      rendererB.setupAgents(simB.agents);

      // İlk kareyi çiz (tur sırasında görünür)
      rendererA.update(simA, 0);
      rendererB.update(simB, 0);

      const statsEl = document.getElementById('stats');
      if (statsEl) statsEl.style.display = 'none';

      resetBtn.style.display  = 'inline-flex';
      startBtn.textContent    = 'Çalışıyor...';

    const doStart = () => {
      simA.startTime = performance.now();
      simB.startTime = performance.now();
      running = true;
      renderLoop();
      startTicking();
    };

      if (typeof window.runTour === 'function') {
        window.runTour(algos, doStart);
      } else {
        doStart();
      }
    } catch (err) {
      console.error('Simülasyon başlatılamadı:', err);
      startBtn.textContent = 'Simülasyonu Başlat';
      startBtn.disabled    = false;
    }
  });

  resetBtn && resetBtn.addEventListener('click', () => {
    stopSim();
    simA = null; simB = null;
    running = false;
    globalFrame = 0;

    resetBtn.style.display  = 'none';
    startBtn.textContent    = 'Simülasyonu Başlat';
    startBtn.disabled       = false;

    const statsEl = document.getElementById('stats');
    if (statsEl) statsEl.style.display = 'none';

    drawPreview();
  });

  window.addEventListener('resize', () => {
    if (rendererA) rendererA.resize();
    if (rendererB) rendererB.resize();
  });

})();
