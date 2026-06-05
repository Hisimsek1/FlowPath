/* algo-select.js — İnteraktif Globe: düğümlere tıklayarak algoritma seç */

(function () {

  const ALGO_DATA = {
    bfs: {
      name: 'BFS',
      full: 'Breadth-First Search',
      badge: 'Uninformed',
      desc: 'Başlangıç noktasından katman katman genişleyerek ilerler. Ağırlıksız grid\'lerde adım sayısı olarak optimal, ancak çok ajanlı senaryolarda çarpışma oranı yüksektir.',
      opt: 'Optimal (adım)',
      speed: 'Orta',
      collision: 'Yüksek ↑',
      image: 'images/BFS.png',
      phi: Math.PI * 0.28,
      theta: Math.PI * 0.3,
    },
    dfs: {
      name: 'DFS',
      full: 'Depth-First Search',
      badge: 'Uninformed',
      desc: 'Bir yolda mümkün olduğunca derine gider, çıkmaza girince geri döner. Uzun ve dolambaçlı yollar üretir — kalabalık ortamlarda çarpışma kaçınılmaz.',
      opt: 'Optimal değil',
      speed: 'Hızlı',
      collision: 'Çok Yüksek ↑↑',
      image: 'images/DFS.png',
      phi: Math.PI * 0.72,
      theta: Math.PI * 1.1,
    },
    dijkstra: {
      name: 'Dijkstra',
      full: "Dijkstra's Algorithm",
      badge: 'Weighted',
      desc: 'Priority queue ile her adımda en düşük maliyetli düğümü işler. Ağırlıklı haritalarda maliyet olarak optimaldir. Oyun motorlarında yaygın kullanım.',
      opt: 'Optimal (maliyet)',
      speed: 'Orta-Yavaş',
      collision: 'Düşük ↓',
      image: 'images/Dijkstra.png',
      phi: Math.PI * 0.55,
      theta: Math.PI * 1.8,
    },
    astar: {
      name: 'A*',
      full: 'A-Star Algorithm',
      badge: 'Informed',
      desc: 'Dijkstra + sezgisel (heuristic). Manhattan mesafe tahmini ile hedefe odaklanır. Hız ve optimallik dengesi — oyun motorlarının standardı.',
      opt: 'Optimal (heuristic)',
      speed: 'Hızlı',
      collision: 'Çok Düşük ↓↓',
      image: 'images/AStar.png',
      phi: Math.PI * 0.38,
      theta: Math.PI * 1.25,
    },
  };

  const ALGO_KEYS = Object.keys(ALGO_DATA);

  // ── DOM referansları ─────────────────────────────────────
  const canvas       = document.getElementById('algo-canvas');
  const labelWrap    = document.getElementById('algo-node-labels');
  const continueBtn  = document.getElementById('algo-continue');
  const infoCard    = document.getElementById('algo-info');
  const placeholder = infoCard?.querySelector('.algo-info-placeholder');
  const detailEl    = document.getElementById('algo-detail');
  const slot0       = document.getElementById('slot-0');
  const slot1       = document.getElementById('slot-1');

  let selected = [];
  let time = 0;
  let hoveredKey = null;

  // Mouse drag state
  let isDragging = false;
  let prevDragX = 0, prevDragY = 0;
  let rotY = 0, rotX = 0;

  if (!canvas || typeof THREE === 'undefined') return;

  // ── Renderer / Scene / Camera ────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 6.5);

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // ── Globe: wireframe küre ────────────────────────────────
  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // Ana wireframe küre
  const sphereGeo = new THREE.SphereGeometry(2.2, 32, 20);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0xf0ede8,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  });
  globeGroup.add(new THREE.Mesh(sphereGeo, sphereMat));

  // Daha belirgin boylamlar (meridyen çizgileri)
  for (let i = 0; i < 8; i++) {
    const theta = (i / 8) * Math.PI * 2;
    const pts = [];
    for (let j = 0; j <= 64; j++) {
      const phi = (j / 64) * Math.PI;
      pts.push(new THREE.Vector3(
        2.22 * Math.sin(phi) * Math.cos(theta),
        2.22 * Math.cos(phi),
        2.22 * Math.sin(phi) * Math.sin(theta),
      ));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    globeGroup.add(new THREE.Line(geo,
      new THREE.LineBasicMaterial({ color: 0xf0ede8, transparent: true, opacity: 0.35 })
    ));
  }

  // Paraleller (enlem çizgileri)
  for (let i = 1; i < 6; i++) {
    const phi = (i / 6) * Math.PI;
    const r   = 2.22 * Math.sin(phi);
    const y   = 2.22 * Math.cos(phi);
    const pts = [];
    for (let j = 0; j <= 64; j++) {
      const t = (j / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(r * Math.cos(t), y, r * Math.sin(t)));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    globeGroup.add(new THREE.Line(geo,
      new THREE.LineBasicMaterial({ color: 0xf0ede8, transparent: true, opacity: 0.25 })
    ));
  }

  // ── Dekoratif ağ düğümleri (Fibonacci dağılımı) ─────────────
  const R = 2.22;
  const DECO_COUNT = 28;
  const decoPositions = [];

  // Fibonacci küre dağılımı — eşit aralıklı noktalar
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < DECO_COUNT; i++) {
    const yy   = 1 - (i / (DECO_COUNT - 1)) * 2;
    const rr   = Math.sqrt(1 - yy * yy);
    const ang  = goldenAngle * i;
    decoPositions.push(new THREE.Vector3(
      R * rr * Math.cos(ang),
      R * yy,
      R * rr * Math.sin(ang),
    ));
  }

  // Dekoratif noktalar — küçük, yarı şeffaf, her biri ayrı materyal (animasyon için)
  const decoGeo = new THREE.SphereGeometry(0.045, 8, 8);
  const decoMeshes = decoPositions.map((pos, i) => {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xf0ede8, transparent: true,
      opacity: 0.4 + Math.random() * 0.4,
    });
    const m = new THREE.Mesh(decoGeo, mat);
    m.position.copy(pos);
    m.userData.baseOpacity = mat.opacity;
    m.userData.phase = Math.random() * Math.PI * 2;
    globeGroup.add(m);
    return m;
  });

  // Bağlantı çizgileri: en yakın 2-3 komşuya çizgi çek
  const MAX_CONN_DIST = 1.6;
  const allPositions  = [...decoPositions];

  // Algoritma düğümlerini de ağa dahil et (bağlantılar için)
  ALGO_KEYS.forEach((key) => {
    const d = ALGO_DATA[key];
    allPositions.push(new THREE.Vector3(
      R * Math.sin(d.phi) * Math.cos(d.theta),
      R * Math.cos(d.phi),
      R * Math.sin(d.phi) * Math.sin(d.theta),
    ));
  });

  const connLineMat = new THREE.LineBasicMaterial({
    color: 0xf0ede8, transparent: true, opacity: 0.22,
  });

  for (let i = 0; i < allPositions.length; i++) {
    let connCount = 0;
    for (let j = i + 1; j < allPositions.length; j++) {
      if (connCount >= 2) break;
      const dist = allPositions[i].distanceTo(allPositions[j]);
      if (dist < MAX_CONN_DIST) {
        const pts = [allPositions[i].clone(), allPositions[j].clone()];
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        globeGroup.add(new THREE.Line(geo, connLineMat));
        connCount++;
      }
    }
  }

  // ── Algoritma düğümleri (interaktif) ─────────────────────
  const nodeMeshes  = {};
  const nodeGlows   = {};
  const nodeWorldPos = {};
  const nodeLabels  = {};

  ALGO_KEYS.forEach((key) => {
    const d = ALGO_DATA[key];

    // Düğüm pozisyonu (küre yüzeyinde)
    const x = R * Math.sin(d.phi) * Math.cos(d.theta);
    const y = R * Math.cos(d.phi);
    const z = R * Math.sin(d.phi) * Math.sin(d.theta);
    nodeWorldPos[key] = new THREE.Vector3(x, y, z);

    // Daha büyük ve parlak ana düğüm
    const geo  = new THREE.SphereGeometry(0.13, 16, 16);
    const mat  = new THREE.MeshBasicMaterial({ color: 0xf0ede8, transparent: true, opacity: 0.95 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.userData.key = key;
    globeGroup.add(mesh);
    nodeMeshes[key] = mesh;

    // Dış halka (her zaman görünür, hafif)
    const ringGeo = new THREE.RingGeometry(0.17, 0.21, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf0ede8, transparent: true, opacity: 0.2, side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(x, y, z);
    ring.lookAt(0, 0, 0);
    globeGroup.add(ring);

    // Glow halkası (hover/seçim)
    const glowGeo = new THREE.RingGeometry(0.17, 0.28, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.set(x, y, z);
    glow.lookAt(0, 0, 0);
    globeGroup.add(glow);
    nodeGlows[key] = glow;

    // HTML etiketi
    const label = document.createElement('div');
    label.className = 'node-label';
    label.textContent = d.name;
    labelWrap.appendChild(label);
    nodeLabels[key] = label;
  });

  // ── Raycaster ────────────────────────────────────────────
  const raycaster = new THREE.Raycaster();
  raycaster.params.Points = { threshold: 0.15 };
  const mouse = new THREE.Vector2(-9, -9);

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevDragX = e.clientX;
    prevDragY = e.clientY;
    canvas.style.cursor = 'grabbing';
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const dx = e.clientX - prevDragX;
      const dy = e.clientY - prevDragY;
      rotY += dx * 0.008;
      rotX += dy * 0.005;
      rotX = Math.max(-0.65, Math.min(0.65, rotX));
      prevDragX = e.clientX;
      prevDragY = e.clientY;
    }
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      canvas.style.cursor = hoveredKey ? 'pointer' : 'default';
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (isDragging) { mouse.set(-9, -9); return; }
    const rect = canvas.getBoundingClientRect();
    mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
  });

  canvas.addEventListener('mouseleave', () => {
    if (!isDragging) mouse.set(-9, -9);
  });

  canvas.addEventListener('click', () => {
    if (!hoveredKey) return;
    const key = hoveredKey;

    if (selected.includes(key)) {
      // Seçimi kaldır
      selected = selected.filter(s => s !== key);
      nodeMeshes[key].material.color.setHex(0xf0ede8);
    } else {
      if (selected.length >= 2) return;
      selected.push(key);
      nodeMeshes[key].material.color.setHex(0xffffff);
    }

    _updateSlots();
    _showDetail(key);
    window.selectedAlgorithms = selected;
    if (continueBtn) continueBtn.disabled = selected.length < 2;
  });

  // ── Detay paneli ─────────────────────────────────────────
  const algoImgEl = document.getElementById('algo-img');

  function _showDetail(key) {
    const d = ALGO_DATA[key];
    if (placeholder) placeholder.style.display = 'none';
    if (!detailEl) return;

    // Resim geçişi: fade out → src değiştir → fade in
    if (algoImgEl) {
      gsap.to(algoImgEl, {
        opacity: 0, duration: 0.18, ease: 'power2.in',
        onComplete: () => {
          algoImgEl.src = d.image || '';
          algoImgEl.onload = () => {
            gsap.fromTo(algoImgEl,
              { opacity: 0 },
              { opacity: 1, duration: 0.45, ease: 'power2.out' }
            );
          };
        },
      });
    }

    // İlk açılışta kart belirir
    if (detailEl.style.display === 'none') {
      detailEl.style.display = 'block';
      gsap.fromTo(detailEl,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }

  function _updateSlots() {
    [slot0, slot1].forEach((slot, i) => {
      if (!slot) return;
      if (selected[i]) {
        slot.textContent = ALGO_DATA[selected[i]].name;
        slot.classList.add('filled');
      } else {
        slot.textContent = '—';
        slot.classList.remove('filled');
      }
    });
  }

  // ── Devam butonu ─────────────────────────────────────────
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (selected.length < 2) return;
      const a = ALGO_DATA[selected[0]];
      const b = ALGO_DATA[selected[1]];
      const display = document.getElementById('sim-algo-display');
      const labelA  = document.getElementById('canvas-label-a');
      const labelB  = document.getElementById('canvas-label-b');
      if (display) display.textContent = `${a.name}  vs  ${b.name}`;
      if (labelA)  labelA.textContent  = a.name;
      if (labelB)  labelB.textContent  = b.name;
      document.getElementById('simulation')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Simülasyon bölümüne scroll tamamlandıktan sonra önizlemeyi çiz
      setTimeout(() => { if (typeof window.drawSimPreview === 'function') window.drawSimPreview(); }, 700);
    });
  }

  // ── Ana animasyon döngüsü ────────────────────────────────
  function animate() {
    requestAnimationFrame(animate);
    time += 0.004;

    // Globe: auto-rotate + mouse drag
    if (!isDragging) {
      rotY += 0.00072; // öncekiyle aynı hız: 0.004 * 0.18
    }
    globeGroup.rotation.y = rotY;
    globeGroup.rotation.x = rotX + Math.sin(time * 0.1) * 0.05;

    // Raycasting — hangi düğümün üzerindeyiz?
    raycaster.setFromCamera(mouse, camera);
    const meshList = ALGO_KEYS.map(k => nodeMeshes[k]);
    const hits = raycaster.intersectObjects(meshList);

    const newHovered = hits.length > 0 ? hits[0].object.userData.key : null;
    if (newHovered !== hoveredKey) {
      hoveredKey = newHovered;
      canvas.style.cursor = hoveredKey ? 'pointer' : 'default';
    }

    // Dekoratif düğüm titremesi
    decoMeshes.forEach((m) => {
      m.material.opacity = m.userData.baseOpacity *
        (0.6 + 0.4 * Math.sin(time * 1.2 + m.userData.phase));
    });

    // Etiketler + glow güncelle
    ALGO_KEYS.forEach((key) => {
      const mesh  = nodeMeshes[key];
      const glow  = nodeGlows[key];
      const label = nodeLabels[key];

      const isHovered  = key === hoveredKey;
      const isSelected = selected.includes(key);
      const pulse      = 0.5 + 0.5 * Math.sin(time * 3 + ALGO_KEYS.indexOf(key));

      // Boyut
      const s = isHovered ? 1.6 : isSelected ? 1.4 : 1.0;
      mesh.scale.setScalar(s + (isHovered ? pulse * 0.2 : 0));

      // Glow
      glow.material.opacity = isHovered
        ? 0.5 + pulse * 0.3
        : isSelected ? 0.35 : 0;

      // Label: düğümün ekran koordinatına yerleştir
      const worldPos = mesh.position.clone();
      globeGroup.localToWorld(worldPos);
      const projected = worldPos.clone().project(camera);

      // Kamera arkasındaysa gizle
      const behindCamera = projected.z > 1;
      const cx = ( projected.x * 0.5 + 0.5) * canvas.clientWidth;
      const cy = (-projected.y * 0.5 + 0.5) * canvas.clientHeight;

      label.style.left = cx + 'px';
      label.style.top  = cy + 'px';
      label.classList.toggle('visible',  (isHovered || isSelected) && !behindCamera);
      label.classList.toggle('selected', isSelected);
    });

    renderer.render(scene, camera);
  }
  animate();

})();
