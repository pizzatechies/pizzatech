/* Academy cyber range + founder's book interactions */
(function () {
  'use strict';
  const { $, $$, rand, randi, pick, addLoop, onVisible, REDUCED } = window.PT;

  const { BOOK_URL, CONTACT_EMAIL } = window.PT.CONFIG;

  /* =========================================================
     Cyber range
     ========================================================= */
  const canvas = $('#cyberRange');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const blockedEl = $('#crBlocked');
    const term = $('#crTerm');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0, H = 0, cx = 0, cy = 0, R = 0;
    let blocked = 0;
    const packets = [], sparks = [];

    function resize() {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2; cy = H * 0.42;
      R = Math.min(W, H) * 0.25;
    }
    resize();
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);

    // hex grid, pre-rendered
    let hex = null;
    function buildHex() {
      hex = document.createElement('canvas');
      hex.width = W * dpr; hex.height = H * dpr;
      const h = hex.getContext('2d');
      h.setTransform(dpr, 0, 0, dpr, 0, 0);
      h.strokeStyle = 'rgba(243,208,126,.07)';
      h.lineWidth = 1;
      const s = 18, w = Math.sqrt(3) * s;
      for (let y = 0, row = 0; y < H + s; y += s * 1.5, row++) {
        for (let x = (row % 2) * (w / 2); x < W + w; x += w) {
          h.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = Math.PI / 6 + (k * Math.PI) / 3;
            const px = x + Math.cos(a) * s, py = y + Math.sin(a) * s;
            k ? h.lineTo(px, py) : h.moveTo(px, py);
          }
          h.closePath();
          h.stroke();
        }
      }
    }
    buildHex();
    window.addEventListener('resize', () => setTimeout(buildHex, 50));

    const ATTACKS = [
      () => `SSH brute-force from 203.0.113.${randi(2, 250)}`,
      () => `SQL injection on /login`,
      () => `phishing link quarantined`,
      () => `port scan from 198.51.100.${randi(2, 250)}`,
      () => `XSS payload stripped on /search`,
      () => `ransomware beacon to 192.0.2.${randi(2, 250)} dropped`,
      () => `credential stuffing · rate-limited`,
    ];
    const ALLOWED = [
      () => `200 GET /api/courses`,
      () => `student login · MFA verified`,
      () => `200 POST /labs/submit`,
    ];
    const TRAINING = [
      () => `CTF flag captured: PT{s4v4nn4_f0rtr3ss}`,
      () => `lab "web-exploitation-101" completed`,
      () => `new cohort member passed recon module`,
    ];
    function log(cls, tag, msg) {
      const d = document.createElement('div');
      d.innerHTML = `<span class="${cls}">[${tag}]</span> ${msg}`;
      term.appendChild(d);
      while (term.children.length > 6) term.removeChild(term.firstChild);
    }
    log('pr', '$', 'pt-shield monitor --range academy --live');
    log('tr', 'ACADEMY', 'cyber range online · 3 labs running');

    function spawn(near) {
      const bad = Math.random() < 0.68;
      const a = rand(0, Math.PI * 2);
      const d = near ? R * rand(2.1, 3.2) : Math.max(W, H) * 0.58;
      packets.push({
        x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, a: a + Math.PI,
        sp: rand(0.11, 0.19) * (bad ? 1 : 1.15), bad, trail: [],
        wob: rand(-0.0015, 0.0015),
      });
    }

    let acc = 0, logAcc = 0;
    for (let i = 0; i < 12; i++) spawn(true);
    const draw = (now, dt) => {
      acc += dt; logAcc += dt;
      if (acc > 190) { acc = 0; if (packets.length < 24) spawn(); }
      if (logAcc > 3800) { logAcc = 0; log('tr', 'ACADEMY', pick(TRAINING)()); }

      ctx.clearRect(0, 0, W, H);
      if (hex) ctx.drawImage(hex, 0, 0, W, H);

      // radar sweep
      const sweep = (now / 2600) % 1 * Math.PI * 2;
      const g = ctx.createConicGradient ? ctx.createConicGradient(sweep, cx, cy) : null;
      if (g) {
        g.addColorStop(0, 'rgba(243,208,126,.22)');
        g.addColorStop(0.12, 'rgba(243,208,126,0)');
        g.addColorStop(1, 'rgba(243,208,126,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, R * 2.1, 0, Math.PI * 2); ctx.fill();
      }

      // defence rings
      const rings = [[R * 1.95, 1, 'rgba(243,208,126,.25)', [6, 10]], [R * 1.55, -1, 'rgba(224,178,90,.35)', [2, 6]], [R * 1.2, 1, 'rgba(243,208,126,.5)', [30, 8]]];
      rings.forEach(([rr, dir, col, dash], i) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((now / (9000 + i * 3000)) * dir * Math.PI * 2);
        ctx.setLineDash(dash);
        ctx.strokeStyle = col;
        ctx.lineWidth = i === 2 ? 2 : 1.2;
        ctx.beginPath(); ctx.arc(0, 0, rr, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      });
      ctx.setLineDash([]);

      // shield
      const pulse = 0.5 + Math.sin(now / 500) * 0.5;
      ctx.save();
      ctx.translate(cx, cy);
      const s = R / 60;
      ctx.scale(s, s);
      ctx.shadowColor = 'rgba(243,208,126,.8)';
      ctx.shadowBlur = 18 + pulse * 14;
      ctx.beginPath();
      ctx.moveTo(0, -56);
      ctx.lineTo(44, -40); ctx.lineTo(44, -6);
      ctx.bezierCurveTo(44, 26, 24, 46, 0, 58);
      ctx.bezierCurveTo(-24, 46, -44, 26, -44, -6);
      ctx.lineTo(-44, -40); ctx.closePath();
      const sg = ctx.createLinearGradient(0, -56, 0, 58);
      sg.addColorStop(0, 'rgba(243,208,126,.28)');
      sg.addColorStop(1, 'rgba(122,90,30,.12)');
      ctx.fillStyle = sg;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#f3d07e';
      ctx.stroke();
      ctx.shadowBlur = 0;
      // lock
      ctx.strokeStyle = '#e0b25a';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, -6, 11, Math.PI, 0); ctx.stroke();
      ctx.fillStyle = '#e0b25a';
      ctx.fillRect(-16, -6, 32, 26);
      ctx.fillStyle = '#07090b';
      ctx.beginPath(); ctx.arc(0, 4, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(-1.8, 4, 3.6, 9);
      ctx.restore();

      // packets
      const edge = R * 1.95;
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.a += p.wob * dt;
        p.x += Math.cos(p.a) * p.sp * dt;
        p.y += Math.sin(p.a) * p.sp * dt;
        p.trail.push([p.x, p.y]);
        if (p.trail.length > 14) p.trail.shift();
        const dist = Math.hypot(p.x - cx, p.y - cy);
        const col = p.bad ? '184,134,47' : '248,227,163';
        // trail
        ctx.strokeStyle = `rgba(${col},.5)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        p.trail.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
        ctx.fillStyle = `rgb(${col})`;
        ctx.shadowColor = `rgb(${col})`;
        ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.bad ? 3.4 : 2.8, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        if (p.bad && dist < edge) {
          for (let k = 0; k < 14; k++) sparks.push({ x: p.x, y: p.y, vx: rand(-0.18, 0.18), vy: rand(-0.18, 0.18), life: 1 });
          sparks.push({ ring: true, x: p.x, y: p.y, life: 1 });
          packets.splice(i, 1);
          blocked++;
          blockedEl.textContent = blocked.toLocaleString('en-US');
          if (Math.random() < 0.45) log('bl', 'BLOCKED', pick(ATTACKS)());
          continue;
        }
        if (!p.bad && dist < R * 0.5) {
          packets.splice(i, 1);
          if (Math.random() < 0.25) log('al', 'ALLOWED', pick(ALLOWED)());
        }
      }

      // sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.life -= dt / (sp.ring ? 500 : 650);
        if (sp.life <= 0) { sparks.splice(i, 1); continue; }
        if (sp.ring) {
          ctx.strokeStyle = `rgba(217,165,72,${sp.life.toFixed(2)})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(sp.x, sp.y, (1 - sp.life) * 22, 0, Math.PI * 2); ctx.stroke();
        } else {
          sp.x += sp.vx * dt; sp.y += sp.vy * dt;
          ctx.fillStyle = `rgba(255,${Math.round(150 + 80 * sp.life)},80,${sp.life.toFixed(2)})`;
          ctx.fillRect(sp.x - 1.2, sp.y - 1.2, 2.4, 2.4);
        }
      }
    };
    if (REDUCED) {
      requestAnimationFrame((t) => draw(t, 16));
      log('bl', 'BLOCKED', ATTACKS[0]());
      log('al', 'ALLOWED', ALLOWED[0]());
      log('tr', 'ACADEMY', TRAINING[0]());
    } else {
      addLoop(canvas, draw);
    }
  }

  /* =========================================================
     "Register interest" pre-selects the training topping
     ========================================================= */
  $$('[data-preselect]').forEach((a) => {
    a.addEventListener('click', () => {
      const box = document.querySelector(`#orderForm input[name="type"][value="${a.dataset.preselect}"]`);
      if (box) box.checked = true;
    });
  });

  /* =========================================================
     The book
     ========================================================= */
  const buy = $('#bookBuy');
  if (buy) {
    if (BOOK_URL) { buy.href = BOOK_URL; buy.target = '_blank'; buy.rel = 'noopener'; }
    else buy.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('The Silicon Savannah Fortress — I want a copy')}`;
  }

  const book = $('#book3d');
  const scene = $('#bookScene');
  if (book && scene) {
    if (!REDUCED) book.classList.add('idle');
    const section = $('#book');
    if (!REDUCED && window.matchMedia('(pointer:fine)').matches) {
      section.addEventListener('mousemove', (e) => {
        const r = scene.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
        const y = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
        book.classList.remove('idle');
        book.style.transform = `rotateY(${(-22 + x * 40).toFixed(1)}deg) rotateX(${(6 - y * 16).toFixed(1)}deg)`;
      });
      section.addEventListener('mouseleave', () => {
        book.style.transform = '';
        book.classList.add('idle');
      });
    }
  }
})();
