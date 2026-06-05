/* hero.js — Three.js wireframe torus knot cismi */

(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 5.5);

  // ── Wireframe malzemesi ───────────────────────
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xf0ede8,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  });

  const wireMat2 = new THREE.MeshBasicMaterial({
    color: 0xf0ede8,
    wireframe: true,
    transparent: true,
    opacity: 0.10,
  });

  // ── Ana cisim: TorusKnot (referanstaki karmaşık halka yapısı) ──
  const knotGeo = new THREE.TorusKnotGeometry(1.6, 0.38, 200, 24, 2, 3);
  const knot = new THREE.Mesh(knotGeo, wireMat);
  scene.add(knot);

  // ── İkinci katman: daha büyük, farklı açı ────
  const knotGeo2 = new THREE.TorusKnotGeometry(2.0, 0.22, 160, 16, 3, 4);
  const knot2 = new THREE.Mesh(knotGeo2, wireMat2);
  knot2.rotation.x = Math.PI * 0.3;
  scene.add(knot2);

  // ── Dış torus halkası ─────────────────────────
  const torusGeo = new THREE.TorusGeometry(2.6, 0.015, 8, 180);
  const torusMat = new THREE.MeshBasicMaterial({
    color: 0xf0ede8,
    transparent: true,
    opacity: 0.12,
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.rotation.x = Math.PI * 0.5;
  scene.add(torus);

  const torus2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.4, 0.015, 8, 180),
    new THREE.MeshBasicMaterial({ color: 0xf0ede8, transparent: true, opacity: 0.08 })
  );
  torus2.rotation.x = Math.PI * 0.3;
  torus2.rotation.y = Math.PI * 0.2;
  scene.add(torus2);

  // ── Canvas konumu: sağ tarafa kaydır ─────────
  // Cisim ekranın sağ-orta kısmında durmalı
  knot.position.x = 1.8;
  knot2.position.x = 1.8;
  torus.position.x = 1.8;
  torus2.position.x = 1.8;

  // ── Resize ───────────────────────────────────
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // ── Mouse parallax ────────────────────────────
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 0.6;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.4;
  });

  // ── Scroll'da küçül ───────────────────────────
  let scrollProgress = 0;
  window.addEventListener('scroll', () => {
    scrollProgress = Math.min(window.scrollY / window.innerHeight, 1);
  });

  // ── Animasyon döngüsü ─────────────────────────
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.004;

    const fade = 1 - scrollProgress * 1.5;
    if (fade <= 0) return;

    knot.rotation.x = time * 0.4 + mouseY * 0.5;
    knot.rotation.y = time * 0.6 + mouseX * 0.5;

    knot2.rotation.x = -time * 0.25 + mouseY * 0.3;
    knot2.rotation.y = time * 0.35 + mouseX * 0.3;
    knot2.rotation.z = time * 0.15;

    torus.rotation.z = time * 0.2;
    torus2.rotation.z = -time * 0.15;
    torus2.rotation.x = Math.PI * 0.3 + time * 0.1;

    wireMat.opacity  = 0.18 * fade;
    wireMat2.opacity = 0.10 * fade;
    torusMat.opacity = 0.12 * fade;

    renderer.render(scene, camera);
  }
  animate();
})();
