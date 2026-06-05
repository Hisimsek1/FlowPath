/* main.js — Lenis + GSAP ScrollTrigger başlatma */

document.addEventListener('DOMContentLoaded', () => {

  // ── Lenis smooth scroll ──────────────────────────
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Lenis <-> GSAP ScrollTrigger senkronizasyonu
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  // ── Hero giriş animasyonu ────────────────────────
  const heroTl = gsap.timeline({ delay: 0.2 });
  heroTl
    .to('.hero-content', { opacity: 1, y: 0, duration: 1.4, ease: 'power3.out' })
    .to('.scroll-hint',  { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.4');

  // ── Hero scroll'da kaybolur, geri gelince geri döner ──
  gsap.fromTo('#hero .hero-content',
    { opacity: 1, y: 0, scale: 1 },
    {
      opacity: 0, y: -60, scale: 0.95,
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    }
  );

  gsap.to('#hero .scroll-hint', {
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '20% top',
      scrub: true,
    },
    opacity: 0,
  });

  // Intro scroll → intro.js yönetiyor

  // ── Story blokları — scroll-driven seamless crossfade ──
  // Ekran sabit, bloklar opacity ile geçiş yapar. Video: bir kez oynar, son karede durur.
  const storyEl     = document.getElementById('story');
  const storyBlocks = Array.from(document.querySelectorAll('.story-block'));
  const N           = storyBlocks.length;

  if (storyEl && N > 0) {
    const vh      = window.innerHeight;
    const SECTION = 200 * vh / 100;  // 200vh per block — uzun hold süresi
    const CROSS   = 90  * vh / 100;  // 90vh crossfade — yavaş, seamless geçiş

    const dots = Array.from(document.querySelectorAll('.story-dot'));

    storyBlocks.forEach((block, i) => {
      const vid    = block.querySelector('.story-video');
      const text   = block.querySelector('.story-text');
      const isLeft = text && text.classList.contains('story-text--left');
      const num    = block.querySelector('.story-num');

      const sStart = i * SECTION;
      const sEnd   = sStart + SECTION;

      // ── Progress dot aktivasyonu ─────────────────────────
      ScrollTrigger.create({
        trigger: storyEl,
        start: `top+=${Math.max(0, sStart - CROSS / 2)}px top`,
        end:   `top+=${sEnd - CROSS / 2}px top`,
        onEnter:     () => { dots.forEach((d, j) => d.classList.toggle('active', j === i)); },
        onEnterBack: () => { dots.forEach((d, j) => d.classList.toggle('active', j === i)); },
      });

      // ── Crossfade fade-in (ilk block hariç) ──────────────
      if (i > 0) {
        gsap.fromTo(block, { opacity: 0 }, {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: storyEl,
            start: `top+=${sStart - CROSS / 2}px top`,
            end:   `top+=${sStart + CROSS / 2}px top`,
            scrub: 2,  // yavaş, akıcı
          },
        });
      }

      // ── Crossfade fade-out (son block hariç) ─────────────
      if (i < N - 1) {
        gsap.to(block, {
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: storyEl,
            start: `top+=${sEnd - CROSS / 2}px top`,
            end:   `top+=${sEnd + CROSS / 2}px top`,
            scrub: 2,
          },
        });
      }

      // ── Yazı animasyonu ───────────────────────────────────
      if (text) {
        const textStart = i === 0 ? 'top 58%' : `top+=${sStart}px top`;
        const textEnd   = i === 0 ? 'top 28%' : `top+=${sStart + CROSS * 0.9}px top`;
        gsap.fromTo(text,
          { opacity: 0, x: isLeft ? -80 : 80 },
          {
            opacity: 1, x: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: storyEl,
              start: textStart,
              end:   textEnd,
              scrub: 1,
            },
          }
        );
      }

      if (num) {
        const numStart = i === 0 ? 'top 58%' : `top+=${sStart}px top`;
        const numEnd   = i === 0 ? 'top 32%' : `top+=${sStart + CROSS * 0.7}px top`;
        gsap.fromTo(num, { opacity: 0, y: 12 }, {
          opacity: 1, y: 0,
          scrollTrigger: {
            trigger: storyEl,
            start: numStart,
            end:   numEnd,
            scrub: 0.8,
          },
        });
      }

      // ── Video: bir kez oynar, son karede durur ────────────
      if (vid) {
        const state = { ended: false };
        vid.addEventListener('ended', () => { state.ended = true; });

        ScrollTrigger.create({
          trigger: storyEl,
          start: `top+=${Math.max(0, sStart - 60)}px top`,
          end:   `top+=${sEnd + 60}px top`,
          onEnter: () => {
            vid.currentTime = 0;
            state.ended = false;
            vid.play().catch(() => {});
          },
          onLeave: () => { /* son karede kal */ },
          onEnterBack: () => {
            // Geri scroll — video bitmemişse devam et
            if (!state.ended) vid.play().catch(() => {});
          },
          onLeaveBack: () => {
            vid.pause();
            vid.currentTime = 0;
            state.ended = false;
          },
        });
      }
    });
  }

  // ── Algoritma seçim bölümü fade-in ──────────────
  gsap.from('#algorithm-select', {
    scrollTrigger: {
      trigger: '#algorithm-select',
      start: 'top 75%',
      end: 'top 40%',
      scrub: 0.6,
    },
    opacity: 0,
    y: 40,
  });

  // ── Simülasyon bölümü fade-in ────────────────────
  gsap.from('#simulation .sim-header', {
    scrollTrigger: {
      trigger: '#simulation',
      start: 'top 75%',
      end: 'top 45%',
      scrub: 0.6,
    },
    opacity: 0,
    y: 30,
  });

  // ── Navbar scroll efekti ─────────────────────────
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });

  ScrollTrigger.refresh();
});
