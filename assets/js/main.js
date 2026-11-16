/* Page orchestration: preloader, nav, cursor, reveals, counters, tilt, form */
(function () {
  'use strict';
  const { $, $$, REDUCED, rand, addLoop, onVisible } = window.PT;

  const { CONTACT_EMAIL } = window.PT.CONFIG;

  const body = document.body;

  /* ---------- emails ---------- */
  $$('.js-email').forEach((a) => { a.href = 'mailto:' + CONTACT_EMAIL; });
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- preloader ---------- */
  const pre = $('#preloader');
  const preLines = $$('.pre-line');
  const preCount = $('#preCount');
  const preRect = $('.pre-fill-rect');
  function finishLoading() {
    if (pre) pre.classList.add('done');
    body.classList.remove('is-loading');
    requestAnimationFrame(() => body.classList.add('ready'));
  }
  if (!pre || REDUCED) {
    finishLoading();
  } else {
    const DURATION = 2300;
    const start = performance.now();
    let lineIdx = 0;
    const tick = (now) => {
      const k = Math.min(1, (now - start) / DURATION);
      const e = 1 - Math.pow(1 - k, 2);
      preCount.textContent = Math.round(e * 100);
      if (preRect) preRect.setAttribute('y', (120 - e * 120).toFixed(1));
      const want = Math.floor(k * preLines.length + 0.3);
      while (lineIdx < Math.min(want, preLines.length)) preLines[lineIdx++].classList.add('on');
      if (k < 1) requestAnimationFrame(tick);
      else setTimeout(finishLoading, 280);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- nav ---------- */
  const nav = $('#nav');
  const progress = $('#scrollProgress');
  const toTop = $('#toTop');
  let lastY = window.scrollY;
  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle('scrolled', y > 30);
    nav.classList.toggle('hide', y > lastY && y > 400 && !menu.classList.contains('open'));
    lastY = y;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? (y / max).toFixed(4) : 0})`;
    if (toTop) toTop.classList.toggle('show', y > 900);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  const burger = $('#navBurger');
  const menu = $('#mobileMenu');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false); });
  onScroll();

  // active section highlight
  const links = $$('.nav-links a');
  const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window) {
    const so = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((l) => l.classList.remove('active'));
        const a = map.get(e.target.id);
        if (a) a.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach((s) => so.observe(s));
  }

  toTop && toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }));

  /* ---------- reveal on scroll ---------- */
  if ('IntersectionObserver' in window) {
    const ro = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); ro.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('[data-reveal]').forEach((n) => ro.observe(n));
  } else {
    $$('[data-reveal]').forEach((n) => n.classList.add('is-in'));
  }

  /* ---------- counters ---------- */
  $$('[data-count]').forEach((n) => {
    let done = false;
    onVisible(n, (v) => {
      if (!v || done) return;
      done = true;
      const to = +n.dataset.count;
      if (REDUCED) { n.textContent = to; return; }
      const start = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - start) / 1600);
        n.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  });

  /* ---------- manifesto word highlight ---------- */
  const mani = $('#manifesto');
  if (mani) {
    const HL = new Set(['African', 'engineers,', 'production-hot.', 'Africa', 'future.', 'Lagos', 'Lusaka,', 'Nairobi', 'Accra']);
    const words = mani.textContent.trim().split(/\s+/);
    mani.innerHTML = words.map((w) => `<span class="mw${HL.has(w) ? ' hl' : ''}">${w}</span>`).join(' ');
    const spans = $$('.mw', mani);
    if (REDUCED) spans.forEach((s) => s.classList.add('on'));
    else {
      const upd = () => {
        const r = mani.getBoundingClientRect();
        const vh = window.innerHeight;
        const k = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
        const n = Math.round(k * spans.length);
        spans.forEach((s, i) => s.classList.toggle('on', i < n));
      };
      window.addEventListener('scroll', upd, { passive: true });
      upd();
    }
  }

  /* ---------- 3D tilt cards ---------- */
  const fine = window.matchMedia('(pointer:fine)').matches;
  if (fine && !REDUCED) {
    $$('[data-tilt]').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(900px) rotateX(${((0.5 - y) * 10).toFixed(2)}deg) rotateY(${((x - 0.5) * 12).toFixed(2)}deg) translateY(-4px)`;
        card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });

    /* magnetic buttons */
    $$('[data-magnetic]').forEach((b) => {
      b.addEventListener('mousemove', (e) => {
        const r = b.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        b.style.transform = `translate(${(x * 0.22).toFixed(1)}px, ${(y * 0.3).toFixed(1)}px)`;
      });
      b.addEventListener('mouseleave', () => { b.style.transform = ''; });
    });

    /* custom cursor */
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    body.append(dot, ring);
    body.classList.add('has-cursor');
    let mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
    }, { passive: true });
    const loopCursor = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx.toFixed(1)}px, ${ry.toFixed(1)}px)`;
      requestAnimationFrame(loopCursor);
    };
    loopCursor();
    document.addEventListener('mouseover', (e) => {
      ring.classList.toggle('hover', !!e.target.closest('a, button, label, [data-tilt], input, textarea'));
    });
    document.addEventListener('mouseleave', () => { mx = my = -100; dot.style.transform = 'translate(-100px,-100px)'; });
  }

  /* ---------- published games ---------- */
  const GAME_LINKS = window.PT.CONFIG.GAME_LINKS || {};
  $$('.gm-play').forEach((a) => {
    const url = GAME_LINKS[a.dataset.game];
    if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.hidden = false; }
  });
  const stkDrop = $('.stk-drop');
  const stkScore = $('.stk-score');
  if (stkDrop && stkScore) {
    let score = 12;
    stkDrop.addEventListener('animationiteration', () => {
      score = score >= 48 ? 1 : score + 1;
      stkScore.textContent = score;
    });
  }

  /* ---------- projects: notify me ---------- */
  $$('.project').forEach((p) => {
    const btn = $('.pj-notify', p);
    btn.addEventListener('click', () => {
      const name = $('h3', p).textContent;
      const on = btn.classList.toggle('on');
      btn.textContent = on ? '✓ On the list' : 'Notify me';
      toast(on ? `🍕 We'll ping you when ${name} comes out of the oven.` : `Removed ${name} from your notifications.`);
    });
  });

  /* ---------- toast ---------- */
  const toastEl = $('#toast');
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('show'), 3200);
  }

  /* ---------- order form ---------- */
  const form = $('#orderForm');
  if (form) {
    const ticket = $('#ticketNo');
    ticket.textContent = String(Math.floor(rand(1000, 9999)));
    const err = $('#ofError');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const F = form.elements;
      const nameIn = F.namedItem('name'), emailIn = F.namedItem('email'), msgIn = F.namedItem('message');
      const name = nameIn.value.trim();
      const email = emailIn.value.trim();
      $$('.field', form).forEach((f) => f.classList.remove('invalid'));
      if (!name) { nameIn.closest('.field').classList.add('invalid'); err.textContent = 'Please tell us your name.'; nameIn.focus(); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { emailIn.closest('.field').classList.add('invalid'); err.textContent = 'That email looks a little undercooked.'; emailIn.focus(); return; }
      err.textContent = '';
      const types = $$('input[name="type"]:checked', form).map((i) => i.value);
      const size = (form.querySelector('input[name="size"]:checked') || {}).value || '';
      const msg = msgIn.value.trim();
      const subject = `Project order #PT-${ticket.textContent} from ${name}`;
      const bodyTxt = `Name: ${name}\nEmail: ${email}\nToppings: ${types.join(', ') || '—'}\nSize: ${size}\n\n${msg}`;
      $('#ofMailto').href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyTxt)}`;
      form.classList.add('sent');
    });
    $('#ofReset').addEventListener('click', () => {
      form.reset();
      form.classList.remove('sent');
      ticket.textContent = String(Math.floor(rand(1000, 9999)));
    });
  }
})();
