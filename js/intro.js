/* intro.js — FLOWPATH oluşum animasyonu (scroll-driven, beyaz parçacıklar) */

(function () {

  const section     = document.getElementById('intro');
  const tagline     = document.querySelector('.intro-tagline');
  const placeholder = document.querySelector('.intro-placeholder');

  if (!section) return;

  const videoEl = document.getElementById('intro-video');
  if (videoEl) videoEl.style.display = 'none';
  if (placeholder) placeholder.style.display = 'flex';

  // ── Canvas kurulumu ──────────────────────────────────────
  const container = placeholder;
  if (!container) return;
  container.innerHTML = '';

  const cvs = document.createElement('canvas');
  cvs.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
  container.appendChild(cvs);
  const ctx = cvs.getContext('2d');

  let W, H;
  let scrollProgress = 0; // 0 → 1, ScrollTrigger tarafından güncellenir
  let frameCount     = 0;
  let lastTime       = 0;
  let running        = false;

  // ── Metin piksel pozisyonları örnekle ────────────────────
  function sampleTextPositions() {
    const off  = document.createElement('canvas');
    off.width  = W;
    off.height = H;
    const oc   = off.getContext('2d');
    const fontSize = Math.min(W * 0.18, H * 0.38);
    oc.fillStyle    = '#fff';
    oc.font         = `900 ${fontSize}px Anton, 'Bebas Neue', sans-serif`;
    oc.textAlign    = 'center';
    oc.textBaseline = 'middle';
    oc.fillText('FLOWPATH', W / 2, H / 2);
    const data = oc.getImageData(0, 0, W, H).data;
    const step = 10;
    const out  = [];
    for (let y = 0; y < H; y += step)
      for (let x = 0; x < W; x += step)
        if (data[(y * W + x) * 4 + 3] > 140) out.push({ x, y });
    return out;
  }

  // ── Parçacık listesi ─────────────────────────────────────
  let particles = [];

  function initParticles() {
    const targets = sampleTextPositions();
    particles = targets.map(t => ({
      sx: Math.random() * W,              // scatter pozisyonu
      sy: Math.random() * H,
      tx: t.x,                            // hedef (metin pikseli)
      ty: t.y,
      vx: (Math.random() - 0.5) * 1.6,   // scatter hızı
      vy: (Math.random() - 0.5) * 1.6,
      phase: Math.random() * Math.PI * 2, // nabız offset
      size:  1.5 + Math.random() * 1.5,
      alpha: 0.18 + Math.random() * 0.45,
    }));
  }

  // ── Ease fonksiyonu ──────────────────────────────────────
  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  // ── Çizim döngüsü ────────────────────────────────────────
  function draw(time) {
    if (!running) return;
    requestAnimationFrame(draw);

    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    frameCount++;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    // Grid çizgileri — beyaz, çok soluk
    const CELL = 48;
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += CELL) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += CELL) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // ── Scroll progress → converge değeri ─────────────────
    // 0.00 – 0.18 : dağınık (scatter)
    // 0.18 – 0.72 : FLOWPATH'e yaklaşıyor (converge)
    // 0.72 – 1.00 : tam oluşmuş, parlıyor (hold)
    const p = scrollProgress;
    let convergeT;
    if (p <= 0.18) {
      convergeT = 0;
    } else if (p <= 0.72) {
      convergeT = easeInOut((p - 0.18) / 0.54);
    } else {
      convergeT = 1;
    }

    particles.forEach((pt) => {

      // Scatter hareketi (convergeT düşükken)
      const moveStrength = Math.max(0, 1 - convergeT * 1.6);
      if (moveStrength > 0) {
        pt.sx += pt.vx * dt * 60 * moveStrength;
        pt.sy += pt.vy * dt * 60 * moveStrength;
        if (pt.sx < 0 || pt.sx > W) { pt.vx *= -1; pt.sx = Math.max(0, Math.min(W, pt.sx)); }
        if (pt.sy < 0 || pt.sy > H) { pt.vy *= -1; pt.sy = Math.max(0, Math.min(H, pt.sy)); }
        if (Math.random() < 0.007) { pt.vx += (Math.random() - 0.5) * 0.4; pt.vy += (Math.random() - 0.5) * 0.4; }
        const spd = Math.sqrt(pt.vx * pt.vx + pt.vy * pt.vy);
        if (spd > 2) { pt.vx *= 2 / spd; pt.vy *= 2 / spd; }
      }

      // Pozisyon interpolasyonu
      let x = pt.sx * (1 - convergeT) + pt.tx * convergeT;
      let y = pt.sy * (1 - convergeT) + pt.ty * convergeT;

      // Oluşunca hafif titreme (canlılık)
      if (convergeT > 0.88) {
        const vib = (convergeT - 0.88) / 0.12;
        x += Math.sin(frameCount * 0.065 + pt.phase) * 0.45 * vib;
        y += Math.cos(frameCount * 0.065 + pt.phase) * 0.45 * vib;
      }

      // Alpha hesabı
      let alpha;
      if (convergeT < 0.25) {
        alpha = pt.alpha;
      } else if (convergeT < 0.88) {
        alpha = pt.alpha + ((convergeT - 0.25) / 0.63) * (0.85 - pt.alpha);
      } else {
        const pulse = 0.5 + 0.5 * Math.sin(frameCount * 0.07 + pt.phase);
        alpha = 0.65 + pulse * 0.35;
      }

      // Glow — tam oluşunca
      if (convergeT > 0.82) {
        const g = (convergeT - 0.82) / 0.18;
        ctx.beginPath();
        ctx.arc(x, y, pt.size * 4.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${g * 0.07})`;
        ctx.fill();
      }

      // Ana nokta — beyaz
      ctx.beginPath();
      ctx.arc(x, y, pt.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    });

    // Tam oluşunca hafif beyaz overlay nefesi
    if (convergeT > 0.88) {
      const pulse = 0.5 + 0.5 * Math.sin(frameCount * 0.05);
      const str   = (convergeT - 0.88) / 0.12;
      ctx.globalAlpha = str * (0.015 + pulse * 0.025);
      ctx.fillStyle   = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }

  // ── Boyutlandırma ─────────────────────────────────────────
  function resize() {
    W = cvs.width  = container.offsetWidth  || window.innerWidth;
    H = cvs.height = container.offsetHeight || window.innerHeight;
    initParticles();
  }
  window.addEventListener('resize', resize);

  // ── ScrollTrigger — scroll progress'i günceller ──────────
  ScrollTrigger.create({
    trigger: '#intro',
    start: 'top top',
    end:   'bottom bottom',
    scrub: true,
    onUpdate:     (self) => { scrollProgress = self.progress; },
    onEnter:      () => { if (!running) { running = true; lastTime = performance.now(); requestAnimationFrame(draw); } },
    onEnterBack:  () => { if (!running) { running = true; lastTime = performance.now(); requestAnimationFrame(draw); } },
    onLeaveBack:  () => { running = false; scrollProgress = 0; },
    onLeave:      () => { /* son kare sabit kalsın */ },
  });

  resize();
  // Sayfa açılışında section görünürdeyse hemen başlat
  const rect = section.getBoundingClientRect();
  if (rect.top < window.innerHeight) {
    running  = true;
    lastTime = performance.now();
    requestAnimationFrame(draw);
  }

  // ── Tagline scroll animasyonu ─────────────────────────────
  if (tagline) {
    gsap.fromTo(tagline,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0,
        scrollTrigger: { trigger: '#intro', start: '15% top', end: '40% top', scrub: 1 } }
    );
    gsap.to(tagline, {
      opacity: 0,
      scrollTrigger: { trigger: '#intro', start: '65% top', end: '80% top', scrub: 1 },
    });
  }

})();
