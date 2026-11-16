/* Globe — dotted earth with Africa lit up and data arcs to the world */
(function () {
  'use strict';
  const { $, addLoop, REDUCED, clamp } = window.PT;
  const canvas = $('#globe');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  /* ---------- coarse continent outlines [lon, lat] ---------- */
  const AFRICA = [[-17.5, 14.7], [-16.5, 19.5], [-17, 21], [-13, 27.5], [-9.8, 29.5], [-9.5, 32.5], [-6.8, 34], [-5.9, 35.8], [-1, 35.4], [3, 36.8], [10, 37.3], [11, 35], [10.2, 33.5], [15, 32.4], [19.5, 30.4], [20.1, 32.1], [25, 31.8], [29.9, 31.2], [32.3, 31.3], [32.5, 29.9], [33.5, 27.2], [35.5, 23.5], [37.2, 19.6], [39, 15.6], [43.2, 12.6], [44.5, 10.4], [51.2, 11.8], [51, 10.4], [49, 6], [46, 2], [42.5, -0.5], [40.2, -2.8], [39.7, -4.1], [39.3, -6.8], [40.4, -10.5], [40.6, -15], [36.9, -17.9], [34.8, -19.8], [35.5, -24], [32.6, -25.9], [32.9, -28.8], [31, -29.9], [27.9, -33], [25.6, -34], [20, -34.8], [18.4, -34.2], [18, -32], [16.5, -28.6], [15.2, -26.6], [14.5, -22.9], [11.8, -17.3], [12.3, -13.5], [13.2, -8.8], [12.2, -6], [11.8, -4.8], [9.4, 0.4], [9.7, 3.9], [8.5, 4.6], [6, 4.3], [3.4, 6.4], [1.2, 6.1], [-0.2, 5.6], [-3, 5.1], [-7.5, 4.4], [-10.8, 6.3], [-13.2, 8.5], [-15, 10.8], [-16.7, 12.4]];
  const MADAGASCAR = [[49.3, -12], [50.4, -15.5], [49.6, -17], [47.5, -24.8], [45.2, -25.5], [43.7, -23.4], [43.3, -21.3], [44.4, -16.2], [47, -15]];
  const EURASIA = [[-9.5, 37], [-9, 43.5], [-1.5, 43.5], [-4.6, 48.4], [1.5, 50.5], [4, 52], [8.5, 54], [8, 57], [10.6, 57.7], [5, 59], [5, 62], [14, 67], [20, 70], [28, 71], [40, 67.5], [44, 68.5], [55, 68.5], [68, 73], [80, 73], [100, 77.5], [113, 73.5], [140, 72.5], [160, 69.5], [180, 68], [180, 65], [178, 62.5], [163, 59.5], [162, 55.5], [156, 51], [156, 57.5], [143, 59.3], [137, 54], [141, 48.5], [135, 43.5], [129.5, 42.5], [129.3, 35.2], [126.5, 34.5], [126, 37.5], [124.5, 40], [121, 40.8], [122, 37.5], [119, 35], [121.9, 31], [121.5, 28], [119.5, 25.5], [114, 22.3], [108, 21.5], [106.5, 20], [106.5, 17.5], [109, 11.5], [106.7, 10.3], [104.8, 8.6], [102, 12.5], [100, 13.5], [99.5, 9.5], [103.4, 1.3], [100.5, 3], [98.5, 8], [97.5, 16.5], [94.2, 16], [92, 21.5], [88, 21.7], [86.5, 20], [80.3, 15.8], [80, 10.4], [77.5, 8], [76, 10], [73, 17], [72.7, 21], [70, 22.5], [67, 24.8], [61.5, 25.2], [57, 25.7], [56.3, 27.2], [51.5, 27.9], [48.6, 30], [50.3, 26.2], [51.5, 25.5], [51.6, 24.3], [56.3, 26.4], [59.8, 22.5], [57.8, 19], [55, 17], [52, 16.2], [48.6, 14], [45, 12.8], [43.4, 12.7], [42.6, 15.5], [39, 21.5], [35, 28], [34.5, 29.5], [34.2, 31.3], [35.5, 33.9], [36, 36.5], [32, 36.2], [27.5, 36.8], [26, 40], [23, 40.5], [22.5, 36.5], [21, 38.5], [19.5, 41.5], [13.5, 45.5], [12.3, 44.5], [16, 41.5], [18.5, 40.2], [16, 38], [12.5, 41.5], [10, 44], [7, 43.7], [3, 43.2], [3.2, 41.9], [0, 39.5], [-0.5, 38], [-2, 36.7], [-5.6, 36]];
  const UK = [[-5.7, 50], [1.5, 51.2], [1.7, 52.7], [0, 53.5], [-1.5, 55.5], [-2, 57.5], [-3.2, 58.6], [-5, 58.6], [-6.2, 56.5], [-5, 55], [-3, 54], [-4.5, 53.3], [-5.2, 51.7]];
  const IRELAND = [[-6, 52.2], [-6.2, 54], [-8, 55.2], [-10, 54], [-10.3, 51.8], [-8, 51.5]];
  const JAPAN = [[130, 31], [131.5, 34], [135, 34], [140, 35], [141, 38.5], [141.5, 41.5], [140, 40], [139.5, 38], [137, 37], [133, 35.5], [130.9, 34]];
  const HOKKAIDO = [[140, 42], [141.5, 45.5], [145.5, 43.5], [143.5, 42]];
  const NAMERICA = [[-168, 65.5], [-162, 70], [-156, 71.3], [-141, 69.6], [-128, 70], [-115, 68.5], [-95, 68], [-88, 68.5], [-82, 64], [-94, 59], [-92.5, 57], [-82, 52.5], [-79, 54.5], [-78, 62.5], [-73, 62], [-65, 60.5], [-61.5, 56], [-56, 52], [-59, 48], [-64.5, 46], [-61, 45.5], [-66, 44.5], [-70, 43.5], [-70, 41.7], [-74, 40.5], [-76, 38], [-76, 35], [-81, 31.5], [-80, 27], [-80.5, 25.2], [-82, 26.5], [-82.8, 28], [-84, 30], [-89, 30.2], [-94, 29.6], [-97.3, 27.5], [-97.5, 22], [-96, 19], [-94.5, 18.2], [-91, 18.5], [-90.5, 21], [-87, 21.5], [-88, 16], [-83.5, 15], [-83.5, 11], [-79.5, 9.3], [-77.5, 8.5], [-80, 7.5], [-85.8, 10.5], [-87.5, 13.2], [-92, 14.5], [-95, 16], [-97.8, 16], [-105.5, 20.5], [-105.6, 23], [-109, 25.5], [-112.8, 31.5], [-117, 32.5], [-120.6, 34.5], [-122.5, 37.5], [-124.2, 40.5], [-124, 46], [-124.7, 48.4], [-127.5, 50.5], [-130.5, 54.5], [-135.5, 58.5], [-140, 59.8], [-146, 61], [-151.5, 59], [-156, 57.5], [-162, 55], [-157.5, 58.5], [-162, 59.8], [-165, 62.5]];
  const GREENLAND = [[-73, 78], [-60, 82], [-30, 83.5], [-20, 81.5], [-18, 77], [-22, 71], [-32, 68], [-42, 60], [-48, 61], [-53, 66], [-55, 71], [-60, 76]];
  const SAMERICA = [[-77.5, 8.5], [-71.5, 12.4], [-64, 10.6], [-61.5, 10.5], [-57, 6], [-52, 4.8], [-50, 1.5], [-48.5, -1.2], [-44, -2.5], [-39, -3.5], [-35, -5.5], [-35, -9], [-38.5, -13], [-39.2, -17.8], [-41, -22], [-44.5, -23.2], [-48.5, -26], [-48.6, -28.6], [-52, -32.5], [-54, -34.8], [-57.5, -35], [-58, -38.5], [-62, -39], [-65, -41.5], [-63.5, -42.5], [-67, -46], [-66, -48], [-69, -51.5], [-68.5, -54.8], [-72, -53.5], [-75, -50], [-74, -44], [-73.5, -37], [-71.5, -30], [-70.4, -23.5], [-70.3, -18.5], [-76, -14], [-79.5, -7.5], [-81.2, -5], [-80, -1.5], [-80, 1], [-78.5, 2.5], [-77.3, 4], [-77.5, 7]];
  const AUSTRALIA = [[113.5, -22], [114, -26.5], [115, -34], [118, -35], [123.5, -34], [129, -31.6], [131.5, -31.5], [135.5, -34.8], [138, -35.5], [140, -38], [146, -39], [150, -37.5], [153.5, -28], [153, -25], [150.5, -22.5], [146, -19], [145.5, -15], [142.5, -10.7], [141.5, -13], [140.8, -17.5], [137.5, -16], [136.7, -12.2], [132.5, -11.5], [130, -13], [129.5, -15], [126, -14], [122, -17.5], [121, -19.5], [116.7, -20.6]];
  const SUMATRA = [[95.3, 5.6], [98.5, 3.5], [104, -1], [106, -5.8], [104.5, -5.8], [101, -3]];
  const BORNEO = [[109, 1.5], [116, 6.8], [119, 5], [118, 1], [116, -3.9], [111, -3], [109, -1]];
  const NGUINEA = [[131, -1.5], [141, -2.6], [147.5, -6], [150, -10.5], [143, -9], [138, -8], [137.5, -5], [132, -4]];
  const NZ = [[172.7, -34.5], [178.5, -37.7], [176.8, -40], [175, -41.6], [174, -41.5], [173, -43.5], [169, -46.6], [166.5, -46], [172.7, -40.5]];

  const LAND = [
    { p: AFRICA, af: true }, { p: MADAGASCAR, af: true },
    { p: EURASIA }, { p: UK }, { p: IRELAND }, { p: JAPAN }, { p: HOKKAIDO }, { p: NAMERICA }, { p: GREENLAND },
    { p: SAMERICA }, { p: AUSTRALIA }, { p: SUMATRA }, { p: BORNEO }, { p: NGUINEA }, { p: NZ },
  ].map((o) => {
    let minX = 999, maxX = -999, minY = 999, maxY = -999;
    o.p.forEach(([x, y]) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); });
    return Object.assign(o, { bb: [minX, maxX, minY, maxY] });
  });

  function inPoly(x, y, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  const RAD = Math.PI / 180;
  const toXYZ = (lon, lat) => [Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD), Math.cos(lat * RAD) * Math.cos(lon * RAD)];

  // sample dots
  const dots = [];
  const STEP = 1.9;
  for (let lat = -56; lat <= 82; lat += STEP) {
    const n = Math.max(1, Math.round((360 * Math.cos(lat * RAD)) / STEP));
    for (let j = 0; j < n; j++) {
      const lon = -180 + (j * 360) / n + (lat % 2) * 0.5;
      for (const L of LAND) {
        const [a, b, c, d] = L.bb;
        if (lon < a || lon > b || lat < c || lat > d) continue;
        if (inPoly(lon, lat, L.p)) { dots.push({ v: toXYZ(lon, lat), af: !!L.af }); break; }
      }
    }
  }

  const HUBS = [
    ['Lagos', 3.4, 6.5], ['Nairobi', 36.8, -1.3], ['Lusaka', 28.3, -15.4], ['Accra', -0.2, 5.6], ['Kigali', 30.1, -1.9],
    ['Cairo', 31.2, 30], ['Johannesburg', 28, -26.2], ['Addis Ababa', 38.7, 9], ['Dakar', -17.4, 14.7], ['Kampala', 32.6, 0.3],
  ];
  const WORLD = [['London', -0.1, 51.5], ['New York', -74, 40.7], ['Dubai', 55.3, 25.2], ['São Paulo', -46.6, -23.5], ['Berlin', 13.4, 52.5], ['Toronto', -79.4, 43.7], ['Singapore', 103.8, 1.35], ['Mumbai', 72.8, 19]];
  const LABELLED = new Set(['Lagos', 'Nairobi', 'Lusaka', 'Cairo', 'Johannesburg', 'Dakar', 'Addis Ababa']);
  const hubV = HUBS.map(([n, lo, la]) => ({ n, v: toXYZ(lo, la), label: LABELLED.has(n) }));
  const worldV = WORLD.map(([n, lo, la]) => ({ n, v: toXYZ(lo, la) }));

  // arcs: africa → world and africa ↔ africa
  function slerp(a, b, t) {
    const dot = clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1);
    const om = Math.acos(dot);
    if (om < 1e-4) return a.slice();
    const s = Math.sin(om);
    const k1 = Math.sin((1 - t) * om) / s, k2 = Math.sin(t * om) / s;
    return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
  }
  const ARC_PAIRS = [
    [0, 'w0'], [1, 'w2'], [2, 'w0'], [3, 'w1'], [6, 'w3'], [7, 'w2'], [5, 'w4'], [8, 'w5'], [1, 'w6'], [9, 'w7'],
    [0, 1], [2, 1], [3, 6], [4, 0], [7, 2],
  ];
  const arcs = ARC_PAIRS.map(([a, b], i) => {
    const A = hubV[a].v;
    const B = typeof b === 'string' ? worldV[+b.slice(1)].v : hubV[b].v;
    const ang = Math.acos(clamp(A[0] * B[0] + A[1] * B[1] + A[2] * B[2], -1, 1));
    const h = 0.04 + ang * 0.22;
    const pts = [];
    for (let t = 0; t <= 1.0001; t += 1 / 48) {
      const p = slerp(A, B, t);
      const lift = 1 + Math.sin(Math.PI * t) * h;
      pts.push([p[0] * lift, p[1] * lift, p[2] * lift]);
    }
    return { pts, phase: (i * 0.137) % 1, speed: 0.00018 + (i % 4) * 0.00004, col: typeof b === 'string' ? (i % 2 ? '#e8bb5c' : '#d9a548') : '#f3d07e' };
  });

  /* ---------- render ---------- */
  let W = 0, H = 0, R = 0, cx = 0, cy = 0;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  function resize() {
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.min(W, H) * 0.4; cx = W / 2; cy = H / 2;
  }
  resize();
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize', resize);

  // glow sprite for african dots
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 32;
  const sg = sprite.getContext('2d');
  const grd = sg.createRadialGradient(16, 16, 0, 16, 16, 16);
  grd.addColorStop(0, 'rgba(255,236,180,1)');
  grd.addColorStop(0.25, 'rgba(232,187,92,.9)');
  grd.addColorStop(1, 'rgba(217,165,72,0)');
  sg.fillStyle = grd;
  sg.fillRect(0, 0, 32, 32);

  let lon0 = -8, lat0 = 8, vel = 0.008, dragging = false;
  function rot(v) {
    const cl = Math.cos(lon0 * RAD), sl = Math.sin(lon0 * RAD);
    // rotate around Y by -lon0
    const x = v[0] * cl - v[2] * sl;
    const z = v[0] * sl + v[2] * cl;
    const y = v[1];
    const cp = Math.cos(lat0 * RAD), sp = Math.sin(lat0 * RAD);
    return [x, y * cp - z * sp, y * sp + z * cp];
  }

  function draw(now, dt) {
    if (!dragging && !REDUCED) lon0 += vel * dt * 0.5;
    ctx.clearRect(0, 0, W, H);

    // atmosphere
    const atm = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.25);
    atm.addColorStop(0, 'rgba(217,165,72,.28)');
    atm.addColorStop(0.4, 'rgba(184,134,47,.08)');
    atm.addColorStop(1, 'rgba(184,134,47,0)');
    ctx.fillStyle = atm;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.25, 0, Math.PI * 2); ctx.fill();

    // ocean sphere
    const sea = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
    sea.addColorStop(0, '#17130b');
    sea.addColorStop(1, '#070605');
    ctx.fillStyle = sea;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(232,187,92,.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // graticule (latitudes)
    ctx.strokeStyle = 'rgba(255,255,255,.04)';
    for (let la = -60; la <= 60; la += 30) {
      ctx.beginPath();
      let first = true;
      for (let lo = -180; lo <= 180; lo += 6) {
        const p = rot(toXYZ(lo, la));
        if (p[2] < 0) { first = true; continue; }
        const sx = cx + p[0] * R, sy = cy - p[1] * R;
        if (first) { ctx.moveTo(sx, sy); first = false; } else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }

    // land dots
    const ds = Math.max(1.2, R / 150);
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      const p = rot(d.v);
      if (p[2] <= 0.02) continue;
      const sx = cx + p[0] * R, sy = cy - p[1] * R;
      if (d.af) {
        const s = ds * (2.6 + p[2] * 2.4);
        ctx.globalAlpha = 0.45 + p[2] * 0.55;
        ctx.drawImage(sprite, sx - s, sy - s, s * 2, s * 2);
      } else {
        ctx.globalAlpha = 0.18 + p[2] * 0.5;
        ctx.fillStyle = '#b9ad94';
        const s = ds * (0.6 + p[2] * 0.6);
        ctx.fillRect(sx - s / 2, sy - s / 2, s, s);
      }
    }
    ctx.globalAlpha = 1;

    // arcs
    arcs.forEach((a) => {
      a.phase = (a.phase + a.speed * dt) % 1.35;
      const P = a.pts.map(rot);
      const vis = (p) => p[2] > 0 || p[0] * p[0] + p[1] * p[1] > 1;
      // faint full arc
      ctx.strokeStyle = a.col;
      ctx.globalAlpha = 0.18;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      let pen = false;
      P.forEach((p) => {
        if (!vis(p)) { pen = false; return; }
        const sx = cx + p[0] * R, sy = cy - p[1] * R;
        if (!pen) { ctx.moveTo(sx, sy); pen = true; } else ctx.lineTo(sx, sy);
      });
      ctx.stroke();
      // travelling comet
      const head = Math.floor(Math.min(1, a.phase) * (P.length - 1));
      const tail = Math.max(0, head - 12);
      for (let k = tail; k < head; k++) {
        const p1 = P[k], p2 = P[k + 1];
        if (!vis(p1) || !vis(p2)) continue;
        ctx.globalAlpha = ((k - tail) / 12) * (a.phase > 1 ? Math.max(0, 1 - (a.phase - 1) * 3) : 1);
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(cx + p1[0] * R, cy - p1[1] * R);
        ctx.lineTo(cx + p2[0] * R, cy - p2[1] * R);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // destination flash
      if (a.phase > 0.98 && a.phase < 1.3) {
        const p = P[P.length - 1];
        if (p[2] > 0) {
          const k = (a.phase - 0.98) / 0.32;
          ctx.strokeStyle = a.col;
          ctx.globalAlpha = 1 - k;
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(cx + p[0] * R, cy - p[1] * R, 3 + k * 14, 0, Math.PI * 2); ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    });

    // world cities
    worldV.forEach((c) => {
      const p = rot(c.v);
      if (p[2] <= 0.05) return;
      const sx = cx + p[0] * R, sy = cy - p[1] * R;
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.4 + p[2] * 0.6;
      ctx.beginPath(); ctx.arc(sx, sy, 2.4, 0, Math.PI * 2); ctx.fill();
      if (p[2] > 0.35 && W > 380) {
        ctx.font = '500 11px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(220,215,235,.75)';
        ctx.fillText(c.n, sx + 6, sy + 4);
      }
    });

    // african hubs
    const pulse = (now % 2000) / 2000;
    hubV.forEach((h, i) => {
      const p = rot(h.v);
      if (p[2] <= 0.05) return;
      const sx = cx + p[0] * R, sy = cy - p[1] * R;
      ctx.globalAlpha = p[2];
      ctx.strokeStyle = i % 3 === 0 ? '#b8862f' : i % 3 === 1 ? '#e8bb5c' : '#f3d07e';
      ctx.lineWidth = 1.4;
      const pp = (pulse + i * 0.1) % 1;
      ctx.globalAlpha = p[2] * (1 - pp);
      ctx.beginPath(); ctx.arc(sx, sy, 3 + pp * 12, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = p[2];
      ctx.fillStyle = '#fff4d0';
      ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI * 2); ctx.fill();
      if (h.label && p[2] > 0.3 && W > 380) {
        ctx.font = '600 11.5px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(h.n, sx + 7, sy - 6);
      }
    });
    ctx.globalAlpha = 1;
  }

  if (REDUCED) { requestAnimationFrame((t) => draw(t, 0)); }
  addLoop(canvas, draw);

  /* ---------- drag to rotate ---------- */
  let px = 0, py = 0;
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true; px = e.clientX; py = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - px, dy = e.clientY - py;
    px = e.clientX; py = e.clientY;
    lon0 -= dx * 0.35;
    lat0 = clamp(lat0 + dy * 0.25, -50, 50);
    vel = clamp(-dx * 0.004, -0.06, 0.06) || vel;
  });
  const end = () => {
    dragging = false;
    // ease the spin back to a gentle default
    const settle = () => { vel += (0.008 - vel) * 0.03; if (Math.abs(vel - 0.008) > 0.001 && !dragging) requestAnimationFrame(settle); };
    settle();
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
})();
