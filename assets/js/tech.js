/* Tech graphics — procedural circuit-board backgrounds with travelling signal pulses.
   Usage: <div class="circuit-bg" data-circuit="R,G,B"></div> inside a positioned section. */
(function () {
  'use strict';
  const { $$, addLoop, rand, REDUCED } = window.PT;

  const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];

  function route(cols, rows) {
    const used = new Uint8Array(cols * rows);
    const traces = [];
    const target = Math.floor((cols * rows) / 9);
    let attempts = 0;
    while (traces.length < target && attempts < target * 6) {
      attempts++;
      let x = Math.floor(Math.random() * cols), y = Math.floor(Math.random() * rows);
      if (used[y * cols + x]) continue;
      let d = Math.floor(Math.random() * 4) * 2; // start orthogonal
      const pts = [[x, y]];
      used[y * cols + x] = 1;
      const len = 4 + Math.floor(Math.random() * 16);
      for (let k = 0; k < len; k++) {
        if (Math.random() < 0.22) d = (d + (Math.random() < 0.5 ? 1 : 7)) % 8;
        const nx = x + DIRS[d][0], ny = y + DIRS[d][1];
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || used[ny * cols + nx]) break;
        x = nx; y = ny;
        used[y * cols + x] = 1;
        // keep only corners to make clean polylines
        const prev = pts[pts.length - 1];
        if (pts.length > 1) {
          const pp = pts[pts.length - 2];
          const sameDir = Math.sign(prev[0] - pp[0]) === DIRS[d][0] && Math.sign(prev[1] - pp[1]) === DIRS[d][1];
          if (sameDir) pts[pts.length - 1] = [x, y];
          else pts.push([x, y]);
        } else pts.push([x, y]);
      }
      if (pts.length >= 2) traces.push(pts);
    }
    return traces;
  }

  function setup(el) {
    const rgb = el.dataset.circuit || '248,227,163';
    const base = document.createElement('canvas');
    const live = document.createElement('canvas');
    el.append(base, live);
    const bctx = base.getContext('2d'), lctx = live.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const G = 22;
    let W = 0, H = 0, traces = [], lens = [], pulses = [];

    function build() {
      W = el.clientWidth; H = el.clientHeight;
      if (!W || !H) return;
      [base, live].forEach((c) => { c.width = W * dpr; c.height = H * dpr; });
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.ceil(W / G) + 1, rows = Math.ceil(H / G) + 1;
      traces = route(cols, rows).map((t) => t.map(([x, y]) => [x * G + 0.5, y * G + 0.5]));
      lens = traces.map((t) => { let L = 0; for (let i = 1; i < t.length; i++) L += Math.hypot(t[i][0] - t[i - 1][0], t[i][1] - t[i - 1][1]); return L; });
      bctx.clearRect(0, 0, W, H);
      bctx.lineJoin = 'round';
      bctx.lineCap = 'round';
      traces.forEach((t) => {
        bctx.strokeStyle = `rgba(${rgb},.16)`;
        bctx.lineWidth = 1.3;
        bctx.beginPath();
        t.forEach(([x, y], i) => (i ? bctx.lineTo(x, y) : bctx.moveTo(x, y)));
        bctx.stroke();
        const [ex, ey] = t[t.length - 1];
        bctx.fillStyle = `rgba(${rgb},.32)`;
        bctx.beginPath(); bctx.arc(ex, ey, 2.6, 0, Math.PI * 2); bctx.fill();
        const [sx, sy] = t[0];
        bctx.strokeStyle = `rgba(${rgb},.28)`;
        bctx.beginPath(); bctx.arc(sx, sy, 2.4, 0, Math.PI * 2); bctx.stroke();
      });
      // a few IC chips
      for (let k = 0; k < Math.round((W * H) / 220000); k++) {
        const cw = 40 + Math.random() * 40, ch = 26 + Math.random() * 26;
        const cx = Math.random() * (W - cw), cy = Math.random() * (H - ch);
        bctx.fillStyle = `rgba(${rgb},.05)`;
        bctx.strokeStyle = `rgba(${rgb},.22)`;
        bctx.lineWidth = 1;
        bctx.fillRect(cx, cy, cw, ch);
        bctx.strokeRect(cx + 0.5, cy + 0.5, cw, ch);
        for (let p = 6; p < cw - 4; p += 7) {
          bctx.beginPath(); bctx.moveTo(cx + p, cy); bctx.lineTo(cx + p, cy - 5); bctx.moveTo(cx + p, cy + ch); bctx.lineTo(cx + p, cy + ch + 5); bctx.stroke();
        }
      }
      pulses = [];
    }

    function pointAt(t, d) {
      for (let i = 1; i < t.length; i++) {
        const seg = Math.hypot(t[i][0] - t[i - 1][0], t[i][1] - t[i - 1][1]);
        if (d <= seg) { const k = d / seg; return [t[i - 1][0] + (t[i][0] - t[i - 1][0]) * k, t[i - 1][1] + (t[i][1] - t[i - 1][1]) * k]; }
        d -= seg;
      }
      return t[t.length - 1];
    }

    build();
    let rT;
    window.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(build, 250); });
    if (REDUCED) return;

    const maxPulses = () => Math.min(36, Math.max(8, Math.round(traces.length / 10)));
    addLoop(el, (now, dt) => {
      if (!traces.length) { build(); return; }
      while (pulses.length < maxPulses()) {
        const i = Math.floor(Math.random() * traces.length);
        if (lens[i] < G * 3) continue;
        pulses.push({ i, d: 0, sp: rand(0.06, 0.16) });
      }
      lctx.clearRect(0, 0, W, H);
      lctx.lineCap = 'round';
      for (let k = pulses.length - 1; k >= 0; k--) {
        const p = pulses[k];
        p.d += p.sp * dt;
        const L = lens[p.i];
        if (p.d > L + 30) { pulses.splice(k, 1); continue; }
        const t = traces[p.i];
        const head = pointAt(t, Math.min(L, p.d));
        const tail = pointAt(t, Math.max(0, p.d - 26));
        const g = lctx.createLinearGradient(tail[0], tail[1], head[0], head[1]);
        g.addColorStop(0, `rgba(${rgb},0)`);
        g.addColorStop(1, `rgba(${rgb},.95)`);
        lctx.strokeStyle = g;
        lctx.lineWidth = 2;
        lctx.beginPath(); lctx.moveTo(tail[0], tail[1]); lctx.lineTo(head[0], head[1]); lctx.stroke();
        if (p.d <= L) {
          lctx.fillStyle = '#fff';
          lctx.shadowColor = `rgb(${rgb})`;
          lctx.shadowBlur = 10;
          lctx.beginPath(); lctx.arc(head[0], head[1], 1.8, 0, Math.PI * 2); lctx.fill();
          lctx.shadowBlur = 0;
        } else {
          // arrival flash on the pad
          const e = t[t.length - 1], k2 = (p.d - L) / 30;
          lctx.strokeStyle = `rgba(${rgb},${(1 - k2).toFixed(2)})`;
          lctx.lineWidth = 1.2;
          lctx.beginPath(); lctx.arc(e[0], e[1], 3 + k2 * 8, 0, Math.PI * 2); lctx.stroke();
        }
      }
    });
  }

  $$('[data-circuit]').forEach(setup);
})();
