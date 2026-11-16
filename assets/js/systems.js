/* Systems — live architecture diagram with flowing request packets */
(function () {
  'use strict';
  const { $, rand, randi, pick, addLoop, onVisible, REDUCED } = window.PT;
  const host = $('#sysDiagram');
  if (!host) return;
  const NS = 'http://www.w3.org/2000/svg';

  const NODES = {
    mobile: { g: 'c', t: 'Mobile', s: 'iOS · Android', ic: 'M', col: '#f8e3a3' },
    web: { g: 'c', t: 'Web', s: 'Next.js', ic: 'W', col: '#f8e3a3' },
    ussd: { g: 'c', t: 'USSD / SMS', s: 'feature phones', ic: '#', col: '#f8e3a3' },
    gw: { g: 'g', t: 'API Gateway', s: 'auth · rate limits', ic: '⇄', col: '#e8bb5c' },
    auth: { g: 's', t: 'Auth', s: 'OAuth2 · OTP', ic: 'A', col: '#f0cf85' },
    pay: { g: 's', t: 'Payments', s: 'mobile money', ic: '$', col: '#f3d07e' },
    orders: { g: 's', t: 'Orders', s: 'go · gRPC', ic: 'O', col: '#d9a548' },
    ai: { g: 's', t: 'AI Engine', s: 'inference', ic: 'AI', col: '#c9973f' },
    pg: { g: 'd', t: 'PostgreSQL', s: 'replicated', ic: 'PG', col: '#d8c49a' },
    redis: { g: 'd', t: 'Redis', s: 'cache · sessions', ic: 'R', col: '#b8862f' },
    kafka: { g: 'd', t: 'Event Bus', s: 'kafka streams', ic: 'K', col: '#e8bb5c' },
  };
  const EDGES = [
    ['mobile', 'gw'], ['web', 'gw'], ['ussd', 'gw'],
    ['gw', 'auth'], ['gw', 'pay'], ['gw', 'orders'], ['gw', 'ai'],
    ['auth', 'redis'], ['auth', 'pg'], ['pay', 'pg'], ['pay', 'kafka'], ['orders', 'pg'], ['orders', 'kafka'], ['ai', 'redis'], ['ai', 'kafka'],
  ];

  const LAYOUTS = {
    wide: {
      vb: [1000, 560], w: 176, h: 60, gww: 190, fs: 16, ss: 11.5, dir: 'h',
      pos: {
        mobile: [110, 140], web: [110, 280], ussd: [110, 420], gw: [372, 280],
        auth: [632, 100], pay: [632, 220], orders: [632, 340], ai: [632, 460],
        pg: [884, 140], redis: [884, 280], kafka: [884, 420],
      },
      labels: [['Clients', 110, 50], ['Edge', 372, 50], ['Services', 632, 50], ['Data', 884, 50]],
    },
    narrow: {
      vb: [560, 660], w: 162, sw: 128, h: 66, gww: 240, fs: 18, ss: 12.5, dir: 'v', centered: true,
      pos: {
        mobile: [95, 70], web: [280, 70], ussd: [465, 70], gw: [280, 230],
        auth: [72, 410], pay: [211, 410], orders: [349, 410], ai: [488, 410],
        pg: [95, 600], redis: [280, 600], kafka: [465, 600],
      },
      labels: [],
    },
  };

  let mode = null, svg, edgeEls = {}, nodeEls = {}, packets = [];

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function build() {
    const m = host.clientWidth < 720 ? 'narrow' : 'wide';
    if (m === mode) return;
    mode = m;
    const L = LAYOUTS[m];
    host.innerHTML = '';
    packets = [];
    svg = el('svg', { viewBox: `0 0 ${L.vb[0]} ${L.vb[1]}`, role: 'img', 'aria-label': 'Animated system architecture: clients, API gateway, services and data stores' }, host);
    const defs = el('defs', {}, svg);
    defs.innerHTML = `<filter id="sysGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

    L.labels.forEach(([t, x, y]) => { const tx = el('text', { x, y, 'text-anchor': 'middle', class: 'sys-group-label' }, svg); tx.textContent = t; });

    const gEdges = el('g', {}, svg);
    const gNodes = el('g', {}, svg);
    edgeEls = {};
    nodeEls = {};
    const wOf = (k) => (k === 'gw' ? L.gww : NODES[k].g === 's' && L.sw ? L.sw : L.w);

    EDGES.forEach(([a, b]) => {
      const [ax, ay] = L.pos[a], [bx, by] = L.pos[b];
      let d;
      if (L.dir === 'h') {
        const sx = ax + wOf(a) / 2, ex = bx - wOf(b) / 2, mx = (sx + ex) / 2;
        d = `M${sx} ${ay} C${mx} ${ay} ${mx} ${by} ${ex} ${by}`;
      } else {
        const sy = ay + L.h / 2, ey = by - L.h / 2, my = (sy + ey) / 2;
        d = `M${ax} ${sy} C${ax} ${my} ${bx} ${my} ${bx} ${ey}`;
      }
      el('path', { d, class: 'sys-edge' }, gEdges);
      const flow = el('path', { d, class: 'sys-flow', stroke: NODES[b].g === 'd' ? NODES[a].col : NODES[b].col }, gEdges);
      edgeEls[a + '>' + b] = flow;
    });

    Object.keys(NODES).forEach((k) => {
      const n = NODES[k];
      const [x, y] = L.pos[k];
      const w = wOf(k), h = L.h;
      const g = el('g', { class: 'sys-node', transform: `translate(${x - w / 2} ${y - h / 2})` }, gNodes);
      el('rect', { class: 'halo', x: -4, y: -4, width: w + 8, height: h + 8, rx: 18, fill: 'none', stroke: n.col, 'stroke-width': 2, filter: 'url(#sysGlow)' }, g);
      el('rect', { class: 'box', width: w, height: h, rx: 14, stroke: n.col, 'stroke-opacity': 0.5 }, g);
      if (L.centered) {
        const t = el('text', { x: w / 2, y: h / 2 - 2, 'text-anchor': 'middle', 'font-size': L.fs, 'font-weight': 600 }, g);
        t.textContent = n.t;
        const s = el('text', { x: w / 2, y: h / 2 + L.ss + 2, 'text-anchor': 'middle', 'font-size': L.ss, class: 'sub' }, g);
        s.textContent = n.s;
        el('circle', { cx: 14, cy: 14, r: 4, fill: n.col }, g);
      } else {
        el('circle', { cx: 30, cy: h / 2, r: 16, fill: n.col, 'fill-opacity': 0.14, stroke: n.col, 'stroke-opacity': 0.6 }, g);
        const ic = el('text', { x: 30, y: h / 2 + 4.5, 'text-anchor': 'middle', 'font-size': n.ic.length > 1 ? 11 : 13, 'font-weight': 700, fill: n.col, 'font-family': 'JetBrains Mono, monospace' }, g);
        ic.textContent = n.ic;
        const t = el('text', { x: 56, y: h / 2 - 3, 'font-size': L.fs, 'font-weight': 600 }, g);
        t.textContent = n.t;
        const s = el('text', { x: 56, y: h / 2 + 14, 'font-size': L.ss, class: 'sub' }, g);
        s.textContent = n.s;
        el('circle', { cx: w - 14, cy: 14, r: 3.5, fill: '#f3d07e', class: 'pz-pad-led' }, g);
      }
      nodeEls[k] = g;
    });

    gPackets = el('g', {}, svg);
    // cache path lengths
    Object.values(edgeEls).forEach((p) => { p._len = p.getTotalLength(); });
  }

  let gPackets;
  function ping(k) {
    const g = nodeEls[k];
    if (!g) return;
    g.classList.add('ping');
    clearTimeout(g._t);
    g._t = setTimeout(() => g.classList.remove('ping'), 160);
  }

  function spawn() {
    const client = pick(['mobile', 'web', 'ussd', 'mobile', 'web']);
    const svc = pick(['auth', 'pay', 'pay', 'orders', 'ai']);
    const datas = EDGES.filter(([a]) => a === svc).map(([, b]) => b);
    const data = pick(datas);
    const route = [client + '>gw', 'gw>' + svc, svc + '>' + data];
    const color = NODES[svc].col;
    const c = el('circle', { r: mode === 'narrow' ? 6 : 4.5, fill: color, filter: 'url(#sysGlow)' }, gPackets);
    packets.push({ c, route, seg: 0, d: 0, speed: rand(0.22, 0.38), nodes: [client, 'gw', svc, data] });
  }

  build();
  let rT;
  window.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(build, 200); });

  let acc = 0;
  const tick = (now, dt) => {
    acc += dt;
    if (acc > 140) { acc = 0; if (packets.length < 26) spawn(); }
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      const path = edgeEls[p.route[p.seg]];
      if (!path) { p.c.remove(); packets.splice(i, 1); continue; }
      p.d += p.speed * dt * (mode === 'narrow' ? 0.8 : 1);
      if (p.d >= path._len) {
        p.d = 0;
        p.seg++;
        ping(p.nodes[p.seg]);
        if (p.seg >= p.route.length) { p.c.remove(); packets.splice(i, 1); continue; }
      }
      const pt = edgeEls[p.route[p.seg]].getPointAtLength(p.d);
      p.c.setAttribute('cx', pt.x.toFixed(1));
      p.c.setAttribute('cy', pt.y.toFixed(1));
    }
  };
  if (!REDUCED) addLoop(host, tick);

  /* ---------- metrics panel ---------- */
  const rpsEl = $('#smRps'), latEl = $('#smLat'), depEl = $('#smDeploys'), spark = $('#smSpark polyline'), logEl = $('#sysLog');
  const series = Array.from({ length: 40 }, () => rand(36, 50));
  let visible = false, deploys = 14;
  onVisible(host.closest('section'), (v) => { visible = v; });

  const LOGS = [
    () => `<span class="svc">[aurex]</span> <span class="ok">✓</span> transfer sent · KES ${randi(1, 40) * 50} · <span class="ms">${randi(90, 260)}ms</span>`,
    () => `<span class="svc">[auth]</span> <span class="ok">✓</span> OTP verified · session ${Math.random().toString(16).slice(2, 8)}`,
    () => `<span class="svc">[orders]</span> <span class="ok">✓</span> order #${Math.random().toString(36).slice(2, 6).toUpperCase()} dispatched · <span class="ms">${randi(12, 60)}ms</span>`,
    () => `<span class="svc">[ai]</span> <span class="ok">✓</span> pronunciation-coach inference · <span class="ms">${randi(18, 44)}ms</span>`,
    () => `<span class="svc">[gateway]</span> ↻ autoscaled to ${randi(8, 16)} pods`,
    () => `<span class="svc">[events]</span> <span class="ok">✓</span> payment.completed → ${randi(2, 5)} consumers`,
    () => `<span class="svc">[ussd]</span> <span class="ok">✓</span> *384# session closed · <span class="ms">${randi(140, 380)}ms</span>`,
  ];

  function drawSpark() {
    const min = 30, max = 60;
    spark.setAttribute('points', series.map((v, i) => `${(i / (series.length - 1)) * 200},${(40 - ((v - min) / (max - min)) * 36 - 2).toFixed(1)}`).join(' '));
  }
  drawSpark();

  function update() {
    if (!visible) return;
    const rps = 12000 + Math.sin(Date.now() / 3000) * 900 + rand(-300, 300);
    rpsEl.textContent = Math.round(rps).toLocaleString('en-US');
    const lat = rand(36, 52);
    latEl.textContent = Math.round(lat);
    series.push(lat);
    series.shift();
    drawSpark();
    if (Math.random() < 0.05) { deploys++; depEl.textContent = deploys; }
    const d = document.createElement('div');
    d.innerHTML = pick(LOGS)();
    logEl.appendChild(d);
    while (logEl.children.length > 12) logEl.removeChild(logEl.firstChild);
  }
  if (!REDUCED) setInterval(update, 650);
  else { for (let i = 0; i < 8; i++) { visible = true; update(); } }
})();
