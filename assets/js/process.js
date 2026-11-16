/* Process — a pizza that assembles itself as you scroll through the recipe */
(function () {
  'use strict';
  const { $, $$, seeded } = window.PT;
  const host = $('#procPizza');
  if (!host) return;

  const rnd = seeded(2026);
  const f = (n) => n.toFixed(1);

  function blob(r, wob, n) {
    let d = '';
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = r + Math.sin(a * 5 + 0.7) * wob + Math.sin(a * 11) * wob * 0.6 + (rnd() - 0.5) * wob;
      d += (i ? 'L' : 'M') + f(Math.cos(a) * rr) + ' ' + f(Math.sin(a) * rr);
    }
    return d + 'Z';
  }

  let flour = '';
  for (let i = 0; i < 60; i++) {
    const a = rnd() * Math.PI * 2, r = rnd() * 215;
    flour += `<circle cx="${f(Math.cos(a) * r)}" cy="${f(Math.sin(a) * r)}" r="${f(0.8 + rnd() * 1.8)}" fill="#fffaf0" opacity="${f(0.3 + rnd() * 0.5)}"/>`;
  }

  let bubbles = '';
  for (let i = 0; i < 22; i++) {
    const a = rnd() * Math.PI * 2, r = 20 + rnd() * 160;
    bubbles += `<ellipse cx="${f(Math.cos(a) * r)}" cy="${f(Math.sin(a) * r)}" rx="${f(5 + rnd() * 9)}" ry="${f(3 + rnd() * 6)}" fill="#fff6cf" opacity=".4"/>`;
  }

  let traces = '';
  for (let s = 0; s < 8; s++) {
    const a = (s / 8) * Math.PI * 2 + 0.3;
    const r0 = 40, r1 = 90 + rnd() * 30, r2 = 150 + rnd() * 25;
    const b = a + (rnd() > 0.5 ? 0.12 : -0.12);
    const pts = [[a, r0], [a, r1], [b, r1 + 26], [b, r2]].map(([aa, rr]) => f(Math.cos(aa) * rr) + ' ' + f(Math.sin(aa) * rr));
    const d = 'M' + pts.join(' L');
    traces += `<path d="${d}" class="pz-trace"/><path d="${d}" class="pz-pulse" pathLength="100" style="--dur:${f(2 + rnd() * 2)}s;--delay:${f(-rnd() * 3)}s"/>`;
    const e = pts[3].split(' ');
    traces += `<circle cx="${e[0]}" cy="${e[1]}" r="5" fill="#1a120a" stroke="#a2601a" stroke-width="2"/>`;
  }

  // toppings with drop-in delays
  let tops = '';
  let k = 0;
  const place = (r0, r1, count, fn) => {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + rnd() * 0.5;
      const r = r0 + rnd() * (r1 - r0);
      tops += `<g transform="translate(${f(Math.cos(a) * r)} ${f(Math.sin(a) * r)})"><g class="tp" style="--d:${(k++ * 0.06).toFixed(2)}s">${fn(i)}</g></g>`;
    }
  };
  place(120, 160, 7, (i) => `<circle r="24" fill="url(#ppPep)"/><circle r="24" fill="none" stroke="#b58232" stroke-width="2" opacity=".6"/>` +
    (i % 3 === 0
      ? `<rect x="-9" y="-9" width="18" height="18" rx="3" fill="#2a0d08" stroke="#e8bb5c" stroke-width="1.4"/><circle r="2.5" fill="#f8e3a3" class="pz-pad-led"/>`
      : `<circle cx="-7" cy="-4" r="3" fill="#b58232" opacity=".6"/><circle cx="6" cy="6" r="2.4" fill="#b58232" opacity=".6"/>`));
  place(55, 95, 5, () => `<g transform="rotate(${Math.round(rnd() * 360)})"><path d="M-17 0 Q0 -14 17 0 Q0 14 -17 0Z" fill="#d8b05a"/><path d="M-15 0 H15" stroke="#8a6420" stroke-width="1.5"/></g>`);
  place(170, 190, 6, () => `<circle r="9" fill="none" stroke="#1c1714" stroke-width="6"/>`);
  place(30, 60, 3, () => `<path d="M-12 4 Q-12 -10 0 -10 Q12 -10 12 4Z" fill="#e8dcc8"/><rect x="-4" y="3" width="8" height="9" rx="2" fill="#d6c8b0"/>`);

  let cuts = '';
  for (let s = 0; s < 8; s++) {
    const a = (s / 8) * Math.PI * 2 + Math.PI / 8;
    cuts += `<path d="M0 0 L${f(Math.cos(a) * 214)} ${f(Math.sin(a) * 214)}" stroke="#8f4417" stroke-width="3" opacity=".55" stroke-linecap="round"/>`;
  }

  host.innerHTML = `<svg viewBox="-260 -260 520 520" aria-hidden="true">
    <defs>
      <radialGradient id="ppDough" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#fbe7bd"/><stop offset=".8" stop-color="#ecc58a"/><stop offset="1" stop-color="#d9a35f"/></radialGradient>
      <radialGradient id="ppBaked" cx="50%" cy="50%" r="50%"><stop offset=".82" stop-color="rgba(160,70,20,0)"/><stop offset=".9" stop-color="rgba(190,95,30,.75)"/><stop offset="1" stop-color="rgba(120,50,15,.95)"/></radialGradient>
      <radialGradient id="ppSauce" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#9a6a22"/><stop offset="1" stop-color="#3d260a"/></radialGradient>
      <radialGradient id="ppCheese" cx="42%" cy="38%" r="65%"><stop offset="0" stop-color="#fff0b0"/><stop offset=".5" stop-color="#f3d07e"/><stop offset="1" stop-color="#f29a2e"/></radialGradient>
      <radialGradient id="ppPep" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#2a2118"/><stop offset="1" stop-color="#0d0a07"/></radialGradient>
      <radialGradient id="ppOven" cx="50%" cy="50%" r="50%"><stop offset=".55" stop-color="rgba(217,165,72,.55)"/><stop offset=".75" stop-color="rgba(184,134,47,.25)"/><stop offset="1" stop-color="rgba(184,134,47,0)"/></radialGradient>
    </defs>

    <g class="pl pl-bake"><circle r="300" fill="url(#ppOven)"/></g>
    <circle r="246" fill="#120f17" stroke="rgba(255,255,255,.08)" stroke-width="2"/>
    <circle r="232" fill="none" stroke="rgba(232,187,92,.18)" stroke-width="1.5" stroke-dasharray="4 8"/>

    <g class="pl pl-dough">
      <circle r="224" fill="url(#ppDough)"/>
      ${flour}
      <circle r="224" fill="url(#ppBaked)" class="proc-crust-baked"/>
    </g>

    <g class="pl pl-sauce">
      <path d="${blob(200, 6, 70)}" fill="url(#ppSauce)"/>
      <g class="proc-wire">
        <rect x="-110" y="-120" width="220" height="40" rx="8"/>
        <rect x="-110" y="-66" width="100" height="100" rx="8"/>
        <rect x="6" y="-66" width="104" height="44" rx="8"/>
        <rect x="6" y="-12" width="104" height="46" rx="8"/>
        <rect x="-110" y="50" width="220" height="24" rx="8"/>
        <rect x="-110" y="86" width="160" height="24" rx="8"/>
      </g>
    </g>

    <g class="pl pl-cheese">
      <path d="${blob(190, 7, 64)}" fill="url(#ppCheese)"/>
      ${bubbles}
      ${traces}
    </g>

    <g class="pl pl-top">${tops}</g>

    <g class="pl pl-serve">
      ${cuts}
      <circle r="30" fill="#1a0d07" stroke="#e8bb5c" stroke-width="2.5"/>
      <text y="6" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="16" fill="#e8bb5c">&lt;/&gt;</text>
      <g class="proc-stamp" transform="translate(120 -170)">
        <g transform="rotate(-12)">
          <rect x="-82" y="-26" width="164" height="52" rx="10" fill="rgba(10,8,14,.85)" stroke="#f3d07e" stroke-width="4"/>
          <text y="10" text-anchor="middle" font-family="Syne, sans-serif" font-weight="800" font-size="28" fill="#f3d07e" letter-spacing="3">SHIPPED</text>
        </g>
      </g>
    </g>

    <g class="proc-heat" fill="none" stroke="#ffb35c" stroke-width="4" stroke-linecap="round">
      <path d="M-60 -236 q-10 -16 0 -32 q10 -16 0 -32"/>
      <path d="M0 -240 q-10 -16 0 -32 q10 -16 0 -32"/>
      <path d="M60 -236 q-10 -16 0 -32 q10 -16 0 -32"/>
    </g>
  </svg>`;

  const NAMES = ['Knead', 'Sauce', 'Cheese', 'Toppings', 'Bake', 'Deliver'];
  const noEl = $('#procStageNo'), nameEl = $('#procStageName');
  const steps = $$('.proc-step');

  function setStage(n) {
    for (let i = 1; i <= 6; i++) host.classList.toggle('s' + i, i <= n);
    steps.forEach((st) => {
      const k = +st.dataset.stage;
      st.classList.toggle('active', k === n);
      st.classList.toggle('done', k < n);
    });
    noEl.textContent = String(n).padStart(2, '0');
    nameEl.textContent = NAMES[n - 1];
  }
  setStage(1);

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setStage(+e.target.dataset.stage); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    steps.forEach((s) => io.observe(s));
  } else {
    setStage(6);
  }
})();
