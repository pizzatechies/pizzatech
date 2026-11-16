/* Hero: code rain, circuit pizza, orbiting tech tags, mini terminal */
(function () {
  'use strict';
  const { $, rand, pick, seeded, addLoop, onVisible, REDUCED, sleep } = window.PT;
  const NS = 'http://www.w3.org/2000/svg';
  const hero = $('#hero');
  if (!hero) return;

  /* =========================================================
     1. Code rain
     ========================================================= */
  const rain = $('#heroRain');
  if (rain && !REDUCED) {
    const ctx = rain.getContext('2d');
    const GLYPHS = '01{}[]<>/=;:()+*&|!?λ#$%ABCDEF0123456789'.split('');
    const WORDS = ['const', 'func', 'async', 'await', 'git', 'push', 'deploy', 'λ', '=>', '{}', 'SELECT', 'import', 'return', 'new', 'go', 'def', 'npm'];
    let cols = [], W = 0, H = 0, fs = 15, acc = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    function resize() {
      W = rain.clientWidth; H = rain.clientHeight;
      rain.width = W * dpr; rain.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fs = W < 640 ? 13 : 15;
      const n = Math.ceil(W / (fs * 1.6));
      cols = Array.from({ length: n }, () => ({ y: rand(-H, 0), sp: rand(0.6, 1.6), word: Math.random() < 0.12 ? pick(WORDS) : null }));
    }
    resize();
    window.addEventListener('resize', resize);
    addLoop(hero, (t, dt) => {
      acc += dt;
      if (acc < 45) return; // ~22fps for a calm rain
      acc = 0;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      ctx.font = '500 ' + fs + 'px "JetBrains Mono", monospace';
      cols.forEach((c, i) => {
        const x = i * fs * 1.6;
        const head = Math.random() < 0.08;
        ctx.fillStyle = head ? '#fff4d0' : (i % 7 === 0 ? 'rgba(243,208,126,.75)' : (i % 5 === 0 ? 'rgba(217,165,72,.75)' : 'rgba(232,187,92,.6)'));
        const txt = c.word && Math.random() < 0.3 ? c.word : pick(GLYPHS);
        ctx.fillText(txt, x, c.y);
        c.y += fs * c.sp;
        if (c.y > H + 40) { c.y = rand(-200, 0); c.sp = rand(0.6, 1.6); c.word = Math.random() < 0.12 ? pick(WORDS) : null; }
      });
    });
  }

  /* =========================================================
     2. Circuit pizza
     ========================================================= */
  const svg = $('#pizza');
  if (svg) buildPizza(svg);

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function buildPizza(svg) {
    const defs = el('defs', {}, svg);
    defs.innerHTML = `
      <radialGradient id="pzCrust" cx="50%" cy="45%" r="55%">
        <stop offset="0.80" stop-color="#e9a04f"/><stop offset="0.9" stop-color="#d07a33"/><stop offset="1" stop-color="#8f4417"/>
      </radialGradient>
      <radialGradient id="pzSauce" cx="50%" cy="45%" r="55%">
        <stop offset="0" stop-color="#9a6a22"/><stop offset="1" stop-color="#3d260a"/>
      </radialGradient>
      <radialGradient id="pzCheese" cx="42%" cy="38%" r="65%">
        <stop offset="0" stop-color="#fff0b0"/><stop offset=".45" stop-color="#f3d07e"/><stop offset="1" stop-color="#f29a2e"/>
      </radialGradient>
      <radialGradient id="pzPep" cx="40%" cy="35%" r="70%">
        <stop offset="0" stop-color="#2a2118"/><stop offset="1" stop-color="#0d0a07"/>
      </radialGradient>
      <radialGradient id="pzShadow" cx="50%" cy="50%" r="50%">
        <stop offset=".7" stop-color="rgba(0,0,0,.55)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/>
      </radialGradient>
      <filter id="pzGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>`;

    // slice geometry: slice points to the upper right
    const A0 = (-67.5 * Math.PI) / 180, A1 = (-22.5 * Math.PI) / 180;
    const R = 300;
    const pt = (a, r) => [Math.cos(a) * r, Math.sin(a) * r];
    const [x0, y0] = pt(A0, R), [x1, y1] = pt(A1, R);
    const bodyClip = el('clipPath', { id: 'pzBodyClip' }, defs);
    el('path', { d: `M0 0 L${x1} ${y1} A${R} ${R} 0 1 1 ${x0} ${y0} Z` }, bodyClip);
    const sliceClip = el('clipPath', { id: 'pzSliceClip' }, defs);
    el('path', { d: `M0 0 L${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1} Z` }, sliceClip);

    el('circle', { cx: 6, cy: 18, r: 290, fill: 'url(#pzShadow)' }, svg);
    const spin = el('g', { class: 'pz-spin' }, svg);
    const strings = el('g', {}, spin);
    const body = el('g', { 'clip-path': 'url(#pzBodyClip)' }, spin);
    const slice = el('g', {}, spin);
    const sliceInner = el('g', { 'clip-path': 'url(#pzSliceClip)' }, slice);
    drawContent(body);
    drawContent(sliceInner);

    // cheese strings between slice and body
    const strs = [];
    [70, 130, 190].forEach((rr, i) => {
      [A0, A1].forEach((a) => {
        const p = el('path', { fill: 'none', stroke: i % 2 ? '#ffd76a' : '#ffe594', 'stroke-width': 5 - i, 'stroke-linecap': 'round' }, strings);
        strs.push({ p, base: pt(a, rr) });
      });
    });

    const u = [Math.cos(-Math.PI / 4), Math.sin(-Math.PI / 4)];
    let t0 = performance.now();
    const update = (now) => {
      const k = ((now - t0) / 6000) % 1;
      // ease in/out pull: rest, pull out, hold, push back
      let e;
      if (k < 0.15) e = 0;
      else if (k < 0.45) e = easeInOut((k - 0.15) / 0.3);
      else if (k < 0.7) e = 1;
      else if (k < 0.95) e = 1 - easeInOut((k - 0.7) / 0.25);
      else e = 0;
      const d = e * 52;
      const dx = u[0] * d, dy = u[1] * d;
      slice.setAttribute('transform', `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
      strs.forEach((s, i) => {
        const [bx, by] = s.base;
        const ex = bx + dx, ey = by + dy;
        const sag = 6 + d * 0.35 + i;
        const mx = (bx + ex) / 2 + 0, my = (by + ey) / 2 + sag;
        s.p.setAttribute('d', `M${bx.toFixed(1)} ${by.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`);
        s.p.setAttribute('opacity', d < 3 ? 0 : Math.max(0, 1 - d / 60).toFixed(2));
      });
    };
    if (REDUCED) update(t0 + 2700); else addLoop(svg, update);
  }

  function easeInOut(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  function drawContent(g) {
    const rnd = seeded(420);
    // crust
    el('circle', { r: 272, fill: 'url(#pzCrust)' }, g);
    for (let i = 0; i < 46; i++) {
      const a = (i / 46) * Math.PI * 2 + rnd() * 0.05;
      el('ellipse', { cx: Math.cos(a) * 258, cy: Math.sin(a) * 258, rx: 6 + rnd() * 8, ry: 3 + rnd() * 3, fill: rnd() > 0.5 ? '#f4b468' : '#b8621f', opacity: 0.55, transform: `rotate(${(a * 180) / Math.PI} ${Math.cos(a) * 258} ${Math.sin(a) * 258})` }, g);
    }
    // sauce
    el('circle', { r: 244, fill: 'url(#pzSauce)' }, g);
    // cheese blob
    let d = '';
    const N = 64;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      const r = 226 + Math.sin(a * 7) * 6 + Math.sin(a * 13 + 1) * 4 + (rnd() - 0.5) * 4;
      d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ' ' + (Math.sin(a) * r).toFixed(1);
    }
    el('path', { d: d + 'Z', fill: 'url(#pzCheese)' }, g);
    // cheese bubbles
    for (let i = 0; i < 26; i++) {
      const a = rnd() * Math.PI * 2, r = 40 + rnd() * 170;
      el('ellipse', { cx: Math.cos(a) * r, cy: Math.sin(a) * r, rx: 6 + rnd() * 10, ry: 4 + rnd() * 6, fill: '#fff6cf', opacity: 0.35 }, g);
    }

    // circuit traces per slice
    const traces = el('g', {}, g);
    const pulses = el('g', {}, g);
    const pads = el('g', {}, g);
    for (let s = 0; s < 8; s++) {
      const mid = ((-67.5 + 22.5 + 45 * s) * Math.PI) / 180;
      const count = 3 + Math.floor(rnd() * 2);
      for (let k = 0; k < count; k++) {
        const off = (k - (count - 1) / 2) * 0.13 + (rnd() - 0.5) * 0.04;
        const a = mid + off;
        const r0 = 46 + rnd() * 30, r1 = 90 + rnd() * 50, r2 = r1 + 26 + rnd() * 30, r3 = Math.min(208, r2 + 30 + rnd() * 40);
        const bend = (rnd() > 0.5 ? 1 : -1) * (0.05 + rnd() * 0.06);
        const p = [[a, r0], [a, r1], [a + bend, r2], [a + bend, r3]].map(([aa, rr]) => [Math.cos(aa) * rr, Math.sin(aa) * rr]);
        const dd = 'M' + p.map((q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' L');
        el('path', { d: dd, class: 'pz-trace' }, traces);
        const pulse = el('path', { d: dd, class: 'pz-pulse', pathLength: 100 }, pulses);
        pulse.style.setProperty('--dur', (2 + rnd() * 2.5).toFixed(2) + 's');
        pulse.style.setProperty('--delay', (-rnd() * 4).toFixed(2) + 's');
        const end = p[3];
        el('circle', { cx: end[0], cy: end[1], r: 6, fill: '#1a120a', stroke: '#a2601a', 'stroke-width': 2.5 }, pads);
        const led = el('circle', { cx: end[0], cy: end[1], r: 2.6, fill: '#fffbe0', class: 'pz-pad-led' }, pads);
        led.style.setProperty('--delay', (-rnd() * 2).toFixed(2) + 's');
        const st = p[0];
        el('circle', { cx: st[0], cy: st[1], r: 3.5, fill: '#a2601a' }, pads);
      }
    }

    // toppings
    const top = el('g', {}, g);
    for (let s = 0; s < 8; s++) {
      const mid = ((-67.5 + 22.5 + 45 * s) * Math.PI) / 180;
      // pepperoni chip
      const a = mid + (rnd() - 0.5) * 0.25, r = 150 + rnd() * 40;
      const cx = Math.cos(a) * r, cy = Math.sin(a) * r;
      const pg = el('g', { transform: `translate(${cx.toFixed(1)} ${cy.toFixed(1)})` }, top);
      el('circle', { r: 25, fill: 'url(#pzPep)' }, pg);
      el('circle', { r: 25, fill: 'none', stroke: '#b58232', 'stroke-width': 2, opacity: 0.6 }, pg);
      if (s % 2 === 0) {
        // chip die
        el('rect', { x: -9, y: -9, width: 18, height: 18, rx: 3, fill: '#2a0d08', stroke: '#e8bb5c', 'stroke-width': 1.4 }, pg);
        for (let q = -1; q <= 1; q++) {
          el('path', { d: `M${q * 5} -9 v-5 M${q * 5} 9 v5 M-9 ${q * 5} h-5 M9 ${q * 5} h5`, stroke: '#e8bb5c', 'stroke-width': 1.4, 'stroke-linecap': 'round' }, pg);
        }
        el('circle', { r: 2.5, fill: '#f8e3a3', class: 'pz-pad-led' }, pg);
      } else {
        for (let q = 0; q < 4; q++) el('circle', { cx: (rnd() - 0.5) * 26, cy: (rnd() - 0.5) * 26, r: 2 + rnd() * 2.2, fill: '#b58232', opacity: 0.7 }, pg);
      }
      // basil or olive
      const a2 = mid + (rnd() - 0.5) * 0.35, r2 = 82 + rnd() * 20;
      const bx = Math.cos(a2) * r2, by = Math.sin(a2) * r2;
      if (s % 3 === 0) {
        el('circle', { cx: bx, cy: by, r: 9, fill: 'none', stroke: '#1c1714', 'stroke-width': 6 }, top);
      } else {
        const rot = rnd() * 360;
        const lg = el('g', { transform: `translate(${bx.toFixed(1)} ${by.toFixed(1)}) rotate(${rot.toFixed(0)})` }, top);
        el('path', { d: 'M-16 0 Q0 -13 16 0 Q0 13 -16 0Z', fill: '#d8b05a' }, lg);
        el('path', { d: 'M-14 0 H14', stroke: '#8a6420', 'stroke-width': 1.5 }, lg);
      }
    }

    // slice cut lines
    for (let s = 0; s < 8; s++) {
      const a = ((-67.5 + 45 * s) * Math.PI) / 180;
      el('path', { d: `M0 0 L${(Math.cos(a) * 246).toFixed(1)} ${(Math.sin(a) * 246).toFixed(1)}`, stroke: '#b9561d', 'stroke-width': 2.5, opacity: 0.45 }, g);
    }
    // centre hub
    el('circle', { r: 34, fill: '#1a0d07', stroke: '#e8bb5c', 'stroke-width': 2.5 }, g);
    el('circle', { r: 40, fill: 'none', stroke: '#e8bb5c', 'stroke-width': 1, opacity: 0.4, 'stroke-dasharray': '3 5' }, g);
    const tx = el('text', { x: 0, y: 6, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace', 'font-weight': 700, 'font-size': 18, fill: '#e8bb5c', filter: 'url(#pzGlow)' }, g);
    tx.textContent = '</>';
  }

  /* =========================================================
     3. Orbiting tags
     ========================================================= */
  const orbit = $('#orbit');
  if (orbit) {
    const TAGS = [
      ['React', '#f8e3a3'], ['Flutter', '#e8cf8f'], ['Go', '#f3d07e'], ['Python', '#e8bb5c'], ['Node.js', '#f3d07e'],
      ['AI', '#f0cf85'], ['Kotlin', '#c9a660'], ['</>', '#d9a548'], ['Swift', '#d9a548'], ['SQL', '#d8c49a'], ['Cloud', '#f8e3a3'], ['{ }', '#e8bb5c'],
    ];
    const items = TAGS.map(([txt, c], i) => {
      const s = document.createElement('span');
      s.textContent = txt;
      s.style.setProperty('--c', c);
      orbit.appendChild(s);
      return { s, a: (i / TAGS.length) * Math.PI * 2, ring: i % 2 };
    });
    const place = (now) => {
      const W = orbit.clientWidth;
      items.forEach((it) => {
        const speed = it.ring ? 0.00016 : -0.00012;
        const a = it.a + now * speed;
        const rx = W * (it.ring ? 0.5 : 0.44), ry = W * (it.ring ? 0.14 : 0.2);
        const tilt = it.ring ? -0.18 : 0.22;
        const x = Math.cos(a) * rx;
        const y = Math.sin(a) * ry + x * tilt;
        const depth = Math.sin(a); // -1 back … 1 front
        const sc = 0.72 + (depth + 1) * 0.18;
        it.s.style.transform = `translate(-50%,-50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${sc.toFixed(3)})`;
        it.s.style.opacity = (0.35 + (depth + 1) * 0.32).toFixed(2);
        it.s.style.zIndex = depth > 0 ? 5 : 1;
        it.s.style.filter = depth < -0.3 ? 'blur(1.5px)' : 'none';
      });
    };
    if (REDUCED) place(0); else addLoop(orbit, place);
  }

  /* =========================================================
     4. Mouse parallax on the pizza stage
     ========================================================= */
  const stage = $('#pizzaStage');
  if (stage && !REDUCED && window.matchMedia('(pointer:fine)').matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
    });
    hero.addEventListener('mouseleave', () => { tx = 0; ty = 0; });
    addLoop(hero, () => {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      stage.style.transform = `rotateY(${(cx * 18).toFixed(2)}deg) rotateX(${(-cy * 18).toFixed(2)}deg)`;
    });
  }

  /* =========================================================
     5. Mini terminal
     ========================================================= */
  const term = $('#heroTerm');
  if (term) {
    const SCRIPT = [
      ['pr', '$ pizzatech new aurex --stack flutter,go'],
      ['ok', '✔ scaffolded 128 files in 0.8s'],
      ['pr', '$ git push origin main'],
      ['mu', '› running 1,284 tests …'],
      ['ok', '✔ all green · deploying to af-south-1'],
      ['pr', '$ pizzatech serve --hot'],
      ['ok', '🍕 served hot · 3 regions live'],
    ];
    let running = false, visible = false;
    onVisible(term, (v) => { visible = v; if (v && !running) run(); });
    async function run() {
      running = true;
      while (visible) {
        term.innerHTML = '';
        for (const [cls, line] of SCRIPT) {
          const div = document.createElement('div');
          const span = document.createElement('span');
          span.className = cls;
          div.appendChild(span);
          term.appendChild(div);
          if (cls === 'pr' && !REDUCED) {
            for (const ch of line) { span.textContent += ch; await sleep(rand(25, 60)); }
          } else {
            span.textContent = line;
            await sleep(REDUCED ? 0 : 380);
          }
          while (term.children.length > 4) term.removeChild(term.firstChild);
          await sleep(REDUCED ? 0 : 520);
        }
        if (REDUCED) break;
        await sleep(2400);
      }
      running = false;
    }
  }
})();
