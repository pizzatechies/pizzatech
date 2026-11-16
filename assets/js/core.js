/* Pizza Technologies — shared utilities
   - visibility-aware animation loop (offscreen effects pause)
   - tiny syntax highlighter
   - Typer: types highlighted code into an element, char by char */
(function () {
  'use strict';

  /* ===== Site config — edit these ===== */
  const CONFIG = {
    CONTACT_EMAIL: 'info@pizzatechnologies.co.ke', // where order tickets & enquiries go
    BOOK_URL: '', // store link for "The Silicon Savannah Fortress" (falls back to an email request)
    GAME_LINKS: { // store / play links — a "Play now" button appears on each game card once its link is set
      pizzaStack: '',
      tennisMayhem: '',
      cloudyPark: '',
    },
  };

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const rand = (a, b) => a + Math.random() * (b - a);
  const randi = (a, b) => Math.floor(rand(a, b + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- seeded PRNG (deterministic procedural art) ---------- */
  function seeded(seed) {
    let s = seed >>> 0;
    return function () {
      s += 0x6D2B79F5;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- visibility ---------- */
  const watchers = new Map();
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          const list = watchers.get(e.target);
          if (list) list.forEach((cb) => cb(e.isIntersecting));
        });
      }, { rootMargin: '120px 0px' })
    : null;

  function onVisible(el, cb) {
    if (!el) return;
    if (!io) { cb(true); return; }
    if (!watchers.has(el)) { watchers.set(el, []); io.observe(el); }
    watchers.get(el).push(cb);
  }

  /* ---------- shared rAF loop ---------- */
  const tasks = new Set();
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(64, now - last);
    last = now;
    if (!document.hidden) {
      tasks.forEach((t) => { if (t.visible) t.fn(now, dt); });
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  function addLoop(el, fn) {
    const task = { fn, visible: !io };
    tasks.add(task);
    onVisible(el, (v) => { task.visible = v; });
    return task;
  }

  /* ---------- highlighter ---------- */
  const KW = new Set((
    'import from export default function return const let var if else for while in of new class extends await async try catch ' +
    'throw package func type struct map range go defer nil interface def self None True False with as lambda yield pass elif not ' +
    'and or is final void override super this true false null undefined static public private protected required late ' +
    'select insert into values create table where on primary key references default name on jobs steps uses run runs-on env ' +
    'fun val when object suspend index'
  ).split(' '));

  function tokenize(code, lang) {
    const out = [];
    const hashComment = lang === 'py' || lang === 'yaml' || lang === 'sh';
    const sqlComment = lang === 'sql';
    const jsx = lang === 'jsx' || lang === 'tsx';
    let i = 0;
    const n = code.length;
    const re = {
      lineCom: hashComment ? /#[^\n]*/y : sqlComment ? /--[^\n]*/y : /\/\/[^\n]*/y,
      blockCom: /\/\*[\s\S]*?\*\//y,
      str: /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/y,
      hex: /#[0-9a-fA-F]{3,8}\b/y,
      tag: /<\/?[A-Za-z][\w.]*/y,
      num: /\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?/y,
      word: lang === 'yaml' || lang === 'css' ? /[A-Za-z_$@][\w$-]*/y : /[A-Za-z_$@][\w$]*/y,
      ws: /\s+/y,
    };
    const tryRe = (r) => { r.lastIndex = i; const m = r.exec(code); return m ? m[0] : null; };

    while (i < n) {
      let m;
      if ((m = tryRe(re.lineCom)) || (m = tryRe(re.blockCom))) { out.push({ t: m, c: 'com' }); i += m.length; continue; }
      if ((m = tryRe(re.str))) { out.push({ t: m, c: 'str' }); i += m.length; continue; }
      if (lang === 'css' && (m = tryRe(re.hex))) { out.push({ t: m, c: 'num' }); i += m.length; continue; }
      if (jsx && (m = tryRe(re.tag))) { out.push({ t: m, c: 'tag' }); i += m.length; continue; }
      if ((m = tryRe(re.num))) { out.push({ t: m, c: 'num' }); i += m.length; continue; }
      if ((m = tryRe(re.word))) {
        const rest = code.slice(i + m.length, i + m.length + 3);
        let c = 'pl';
        if (KW.has(lang === 'sql' ? m.toLowerCase() : m)) c = 'kw';
        else if (/^\s*\(/.test(rest)) c = 'fn';
        else if (/^:(?!:)/.test(rest) && (lang === 'yaml' || lang === 'css' || jsx || lang === 'dart')) c = 'prop';
        else if (/^[A-Z]/.test(m)) c = 'type';
        else if (m[0] === '@') c = 'kw';
        out.push({ t: m, c });
        i += m.length;
        continue;
      }
      if ((m = tryRe(re.ws))) { out.push({ t: m, c: 'pl' }); i += m.length; continue; }
      out.push({ t: code[i], c: 'op' });
      i += 1;
    }
    return out;
  }

  function highlightHTML(code, lang) {
    return tokenize(code, lang).map((tk) => '<span class="tk-' + tk.c + '">' + escapeHTML(tk.t) + '</span>').join('');
  }
  function escapeHTML(s) {
    return s.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  /* ---------- Typer ---------- */
  class Typer {
    constructor(el, opts = {}) {
      this.el = el;
      this.onChar = opts.onChar || null;
      this.onLine = opts.onLine || null;
      this.speed = opts.speed || [22, 62];
      this.visible = true;
      this.waiters = [];
      this.caret = document.createElement('span');
      this.caret.className = 'caret';
      this.el.appendChild(this.caret);
      this.lines = 1;
      this.stopped = false;
      if (opts.watch) onVisible(opts.watch, (v) => { this.visible = v; if (v) this.flush(); });
    }
    flush() { const w = this.waiters; this.waiters = []; w.forEach((r) => r()); }
    whenVisible() { return this.visible && !document.hidden ? Promise.resolve() : new Promise((r) => this.waiters.push(r)); }
    clear() {
      this.el.textContent = '';
      this.el.appendChild(this.caret);
      this.lines = 1;
      this.el.scrollTop = 0;
    }
    async type(code, lang) {
      const tokens = tokenize(code, lang);
      if (REDUCED) {
        tokens.forEach((tk) => this.append(tk));
        this.lines += (code.match(/\n/g) || []).length;
        if (this.onLine) this.onLine(this.lines);
        return;
      }
      for (const tk of tokens) {
        const span = document.createElement('span');
        span.className = 'tk-' + tk.c;
        const tn = document.createTextNode('');
        span.appendChild(tn);
        this.el.insertBefore(span, this.caret);
        for (const ch of tk.t) {
          if (this.stopped) return;
          await this.whenVisible();
          tn.appendData(ch);
          if (ch === '\n') {
            this.lines++;
            if (this.onLine) this.onLine(this.lines);
            this.el.scrollTop = this.el.scrollHeight;
          }
          if (this.onChar && ch.trim()) this.onChar(ch);
          await sleep(this.delay(ch));
        }
      }
      this.el.scrollTop = this.el.scrollHeight;
    }
    append(tk) {
      const span = document.createElement('span');
      span.className = 'tk-' + tk.c;
      span.textContent = tk.t;
      this.el.insertBefore(span, this.caret);
    }
    delay(ch) {
      if (ch === '\n') return rand(120, 260);
      if (ch === ' ') return rand(10, 30);
      if (Math.random() < 0.02) return rand(250, 520); // thinking...
      return rand(this.speed[0], this.speed[1]);
    }
    async pause(ms) {
      const end = Date.now() + ms;
      while (Date.now() < end) { await this.whenVisible(); await sleep(Math.min(200, end - Date.now())); }
    }
  }

  window.PT = { CONFIG, REDUCED, $, $$, rand, randi, pick, clamp, lerp, sleep, seeded, onVisible, addLoop, tokenize, highlightHTML, escapeHTML, Typer };
})();
