/* Live Build — code typed in the IDE assembles a real UI on the phone */
(function () {
  'use strict';
  const { $, Typer, sleep, REDUCED, rand } = window.PT;
  const codeEl = $('#ideCode');
  if (!codeEl) return;

  const section = $('#live');
  const gutter = $('#ideGutter');
  const term = $('#ideTerm');
  const screen = $('#phoneScreen');
  const tab = $('#ideTab');
  const treeFile = $('#ideTreeFile');
  const appName = $('#ideStatusApp');
  const caption = $('#phoneCaption');
  const phoneTime = $('#phoneTime');

  if (phoneTime) {
    const d = new Date();
    phoneTime.textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  /* ---------- phone components ---------- */
  const ICON_BELL = '<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>';
  const C = {
    header: () => `<div class="app-header"><div class="app-avatar">AM</div><div class="app-hello"><small>Habari, welcome back</small><b>Amina 👋</b></div><div class="app-bell">${ICON_BELL}</div></div>`,
    balance: () => `<div class="app-balance"><small>Total balance</small><div class="amt">KES <span data-count-to="48250.75">0.00</span></div><div class="meta"><span>•••• 4821</span><span>Aurex</span></div></div>`,
    actions: () => `<div class="app-actions"><div><span>↑</span>Send</div><div><span>↓</span>Receive</div><div><span>⇅</span>Trade</div><div><span>▦</span>Pay</div></div>`,
    chart: () => {
      const hs = [38, 62, 45, 80, 52, 70, 95];
      const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
      return `<div class="app-chart"><div class="ttl"><span>Portfolio · 7 days</span><b>▲ 4.2%</b></div><div class="app-bars">${hs.map((h, i) => `<i style="--h:${h}%;--d:${i * 0.07}s" class="${i === 6 ? 'today' : ''}"></i>`).join('')}</div><div class="app-days">${days.map((d) => `<span>${d}</span>`).join('')}</div></div>`;
    },
    tx: () => `<div class="app-tx">
        <div class="row"><span class="ico">🛒</span><span class="nm">Market groceries<small>Today · 10:24</small></span><span class="v neg">−850</span></div>
        <div class="row"><span class="ico">🛵</span><span class="nm">Boda ride<small>Today · 08:02</small></span><span class="v neg">−200</span></div>
        <div class="row"><span class="ico">💸</span><span class="nm">From Kofi<small>Yesterday</small></span><span class="v pos">+2,500</span></div>
      </div>`,
    streak: () => `<div class="app-header"><div class="app-avatar ly">LY</div><div class="app-hello"><small>Habari! Keep it going</small><b>🔥 12-day streak</b></div><div class="app-bell">${ICON_BELL}</div></div>`,
    lesson: () => `<div class="ly-lesson"><small>Kiswahili · Unit 2</small><b>Greetings &amp; introductions</b><div class="ly-prog"><i></i></div><span>3 of 5 lessons · 20 XP goal</span></div>`,
    words: () => `<div class="ly-words"><div><b>Habari</b><small>Hello</small></div><div><b>Asante</b><small>Thank you</small></div><div><b>Karibu</b><small>Welcome</small></div><div><b>Rafiki</b><small>Friend</small></div></div>`,
    langs: () => `<div class="ly-langs"><span class="on">Kiswahili</span><span>Gikuyu</span><span>Dholuo</span><span>Luhya</span><span>Kalenjin</span></div>`,
    coach: () => `<div class="app-chat"><div class="app-bubble">🎙️ <b>Voice coach:</b> “Asante sana” — 94% match. Great pronunciation!</div><div class="app-input"><span>Tap to speak…</span><i>●</i></div></div>`,
  };

  const APPS = [
    {
      name: 'aurex', file: 'wallet.jsx', caption: 'Aurex · prototype', theme: '',
      steps: [
        { code: `// app/wallet.jsx — Aurex\nimport { Screen } from '@pizzatech/ui';\n\nexport default function Wallet() {\n  return (\n    <Screen theme="aurex">\n` },
        { code: `      <Header user="Amina" />\n`, comp: 'header', label: '<Header/>' },
        { code: `      <BalanceCard amount={48250.75} />\n`, comp: 'balance', label: '<BalanceCard/>' },
        { code: `      <Actions items={quickActions} />\n`, comp: 'actions', label: '<Actions/>' },
        { code: `      <MarketChart days={7} />\n`, comp: 'chart', label: '<MarketChart/>' },
        { code: `      <Transactions limit={3} />\n`, comp: 'tx', label: '<Transactions/>' },
        { code: `    </Screen>\n  );\n}` },
      ],
    },
    {
      name: 'lugha-yetu', file: 'learn.jsx', caption: 'Lugha Yetu · prototype', theme: 'lugha',
      steps: [
        { code: `// app/learn.jsx — Lugha Yetu\nimport { Screen } from '@pizzatech/ui';\n\nexport default function Learn() {\n  return (\n    <Screen theme="lugha">\n` },
        { code: `      <Streak days={12} />\n`, comp: 'streak', label: '<Streak/>' },
        { code: `      <LessonCard unit={2} />\n`, comp: 'lesson', label: '<LessonCard/>' },
        { code: `      <WordDeck size={4} />\n`, comp: 'words', label: '<WordDeck/>' },
        { code: `      <LanguagePicker />\n`, comp: 'langs', label: '<LanguagePicker/>' },
        { code: `      <VoiceCoach ai />\n`, comp: 'coach', label: '<VoiceCoach/>' },
        { code: `    </Screen>\n  );\n}` },
      ],
    },
  ];

  /* ---------- helpers ---------- */
  function setGutter(n) {
    let s = '';
    for (let i = 1; i <= n; i++) s += i + '\n';
    gutter.textContent = s;
  }
  function log(html) {
    const d = document.createElement('div');
    d.innerHTML = html;
    term.appendChild(d);
    while (term.children.length > 5) term.removeChild(term.firstChild);
  }
  function countUp(el) {
    const to = parseFloat(el.dataset.countTo);
    const start = performance.now(), dur = 1400;
    const step = (now) => {
      const k = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = (to * e).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function render(comp, label) {
    const wrap = document.createElement('div');
    wrap.className = 'pc';
    wrap.innerHTML = C[comp]() + `<span class="pc-label">${label.replace(/</g, '&lt;')}</span>`;
    screen.appendChild(wrap);
    requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('in', 'flash')));
    const cnt = wrap.querySelector('[data-count-to]');
    if (cnt) countUp(cnt);
  }
  function confetti() {
    const box = document.createElement('div');
    box.className = 'confetti';
    const cols = ['#e8bb5c', '#b8862f', '#f3d07e', '#f8e3a3', '#c9973f'];
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('i');
      p.style.left = rand(0, 100) + '%';
      p.style.background = cols[i % cols.length];
      p.style.setProperty('--x', rand(-60, 60).toFixed(0) + 'px');
      p.style.setProperty('--r', rand(-720, 720).toFixed(0) + 'deg');
      p.style.animationDelay = rand(0, 0.5).toFixed(2) + 's';
      box.appendChild(p);
    }
    screen.parentElement.appendChild(box);
    setTimeout(() => box.remove(), 3200);
  }

  /* ---------- main loop ---------- */
  const typer = new Typer(codeEl, { watch: section, speed: [26, 64], onLine: setGutter });

  (async function run() {
    let a = 0;
    for (;;) {
      const app = APPS[a % APPS.length];
      // reset
      typer.clear();
      setGutter(1);
      screen.innerHTML = '';
      screen.className = 'phone-screen' + (app.theme ? ' ' + app.theme : '');
      document.querySelectorAll('.phone .app-deployed').forEach((n) => n.remove());
      tab.textContent = app.file;
      treeFile.textContent = app.file;
      appName.textContent = app.name;
      caption.textContent = app.caption;
      term.innerHTML = '';
      log(`<span class="pr">$</span> pizzatech dev --app ${app.name}`);
      await typer.pause(500);
      log(`<span class="ok">✓</span> ready on <span class="hot">localhost:3000</span> · hot reload on`);

      for (const st of app.steps) {
        await typer.type(st.code, 'jsx');
        if (st.comp) {
          render(st.comp, st.label);
          log(`<span class="mu">›</span> hmr update <span class="hot">${st.label.replace(/</g, '&lt;')}</span> <span class="mu">${Math.round(rand(18, 64))}ms</span>`);
          await typer.pause(REDUCED ? 0 : 700);
        }
      }

      await typer.pause(REDUCED ? 0 : 600);
      log(`<span class="pr">$</span> pizzatech deploy --prod`);
      await typer.pause(REDUCED ? 0 : 900);
      log(`<span class="ok">✓</span> built ${Math.round(rand(180, 260))} modules in ${rand(1.4, 2.4).toFixed(1)}s`);
      await typer.pause(REDUCED ? 0 : 700);
      log(`<span class="ok">✓</span> deployed to production <span class="hot">🍕 served hot</span>`);

      const toast = document.createElement('div');
      toast.className = 'app-deployed';
      toast.innerHTML = `<span class="rk">🚀</span><span><b>Deployed!</b>${app.caption.split(' · ')[0]} is live</span>`;
      screen.parentElement.appendChild(toast);
      requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('in')));
      if (!REDUCED) confetti();

      if (REDUCED) break;
      await typer.pause(4200);
      toast.classList.remove('in');
      await typer.pause(500);
      a++;
    }
  })();
})();
