/* The Kitchen — live engineering workstations
   Each station = a real-looking IDE typing code + a live tool panel + terminal. */
(function () {
  'use strict';
  const { $, $$, rand, randi, Typer, addLoop, onVisible, REDUCED } = window.PT;

  const STATIONS = {
    frontend: {
      hc: '248,227,163', user: 'frontend', repo: 'aurex-web', widget: 'browser',
      snippets: [
        {
          file: 'src/AurexWallet.tsx', lang: 'tsx', label: 'TSX', done: '✓ Compiled successfully · HMR 41ms',
          cmd: 'pnpm dev', out: ['▲ Next.js ready on localhost:3000', '○ compiling /wallet …'],
          code: `import { useWallet, useMarkets } from '@pizzatech/aurex-sdk';
import { motion } from 'framer-motion';

export function AurexWallet() {
  const { balance, send } = useWallet();
  const markets = useMarkets(['BTC/KES', 'USD/KES']);

  return (
    <motion.main className="wallet" layout>
      <BalanceCard amount={balance} currency="KES" />
      <MarketTicker data={markets} />
      <SendMoney onSend={send} />
      <TransactionList live />
    </motion.main>
  );
}`,
        },
        {
          file: 'src/styles/balance-card.css', lang: 'css', label: 'CSS', done: '✓ Styles hot-reloaded',
          cmd: 'pnpm lint:css', out: ['✓ 0 problems'],
          code: `/* Aurex balance card */
.balance-card {
  background: linear-gradient(120deg, #e8bb5c, #b8862f);
  border-radius: 24px;
  box-shadow: 0 20px 40px -12px #b8862f88;
  animation: rise 600ms ease-out both;
}

@keyframes rise {
  from { transform: translateY(24px); opacity: 0; }
}`,
        },
      ],
    },
    backend: {
      hc: '243,208,126', user: 'backend', repo: 'aurex-core', widget: 'tests',
      snippets: [
        {
          file: 'transfers/send.go', lang: 'go', label: 'GO', done: '✓ go test ./... PASS (0.42s)',
          cmd: 'go test ./transfers/... -race', out: ['=== RUN   TestSend'],
          code: `package transfers

// Send moves money between two Aurex wallets.
func (s *Service) Send(ctx Ctx, r SendReq) (*Receipt, error) {
  if err := r.Validate(); err != nil {
    return nil, fmt.Errorf("invalid: %w", err)
  }
  tx, err := s.ledger.Transfer(ctx, r.From, r.To, r.Amount)
  if err != nil {
    return nil, err
  }
  s.bus.Publish("transfer.completed", tx.ID)
  return &Receipt{ID: tx.ID, Status: "SENT"}, nil
}`,
        },
        {
          file: 'migrations/0042_wallets.sql', lang: 'sql', label: 'SQL', done: '✓ migration 0042 applied',
          cmd: 'make migrate', out: ['applying 0042_wallets.sql …'],
          code: `-- migration: 0042_create_wallets
CREATE TABLE wallets (
  id         UUID PRIMARY KEY,
  owner_id   UUID NOT NULL REFERENCES users(id),
  currency   CHAR(3) NOT NULL DEFAULT 'KES',
  balance    NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_wallets_owner ON wallets(owner_id);`,
        },
      ],
    },
    mobile: {
      hc: '201,151,63', user: 'mobile', repo: 'lugha-yetu', widget: 'emulator',
      snippets: [
        {
          file: 'lib/main.dart', lang: 'dart', label: 'DART', done: '✓ flutter build apk · 14.2 MB',
          cmd: 'flutter run -d pixel_8', out: ['Launching lib/main.dart on Pixel 8 …'],
          code: `class LughaYetuApp extends StatelessWidget {
  const LughaYetuApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Lugha Yetu',
      theme: PizzaTheme.savanna(),
      home: const LessonScreen(
        languages: ['Kiswahili', 'Gikuyu', 'Dholuo'],
        dailyGoalXp: 20,
        offlineFirst: true,
      ),
    );
  }
}`,
        },
        {
          file: 'tenantflex-android/Ussd.kt', lang: 'kt', label: 'KOTLIN', done: '✓ USSD flow verified on 2G',
          cmd: './gradlew test', out: ['> Task :app:testDebugUnitTest'],
          code: `// TenantFlex USSD fallback for feature phones
fun handleUssd(session: UssdSession): UssdReply {
  return when (session.input) {
    "" -> menu("Welcome to TenantFlex",
               "1. Pay rent", "2. Report an issue")
    "1" -> prompt("Enter amount (KES):")
    "2" -> prompt("Describe the issue:")
    else -> end("Asante! Your landlord has been notified.")
  }
}`,
        },
      ],
    },
    ai: {
      hc: '232,187,92', user: 'ai', repo: 'lugha-voice', widget: 'training',
      snippets: [
        {
          file: 'train_pronunciation.py', lang: 'py', label: 'PY', done: '✓ acc=97.4% · exported pronunciation-coach.onnx',
          cmd: 'python train_pronunciation.py', out: ['loading 48,120 voice clips …'],
          code: `import torch
from pizzatech.ml import SpeechTutor, Trainer

model = SpeechTutor(languages=["sw", "ki", "luo"], size="small")
trainer = Trainer(model, data="s3://lugha-yetu/voice-clips")

for epoch in range(1, 11):
    loss, acc = trainer.fit_epoch()
    print(f"epoch {epoch}: loss={loss:.3f} acc={acc:.1%}")

model.export("pronunciation-coach.onnx")  # runs offline`,
        },
        {
          file: '.github/workflows/deploy.yml', lang: 'yaml', label: 'YAML', done: '✓ deployed to af-south-1',
          cmd: 'gh workflow run bake-and-ship', out: ['✓ Created workflow_dispatch event'],
          code: `# bake & ship on every push
name: bake-and-ship
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: make test
      - run: make deploy REGION=af-south-1`,
        },
      ],
    },
  };

  /* ---------------------------------------------------------
     Tool panels
     --------------------------------------------------------- */
  function sizeCanvas(cv, ctx) {
    const W = cv.clientWidth, H = cv.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return [W, H];
  }

  const WIDGETS = {
    browser: {
      html: `<div class="wg-head"><span class="wg-dots"><i></i><i></i><i></i></span><span class="wg-url">localhost:3000/wallet</span></div>
        <div class="fe-page">
          <div class="fe-el fe-nav" data-k="10"><b>aurex</b><i></i><i></i><i></i></div>
          <div class="fe-el fe-bal" data-k="11"><small>Total balance</small><b>KES 48,250.75</b></div>
          <div class="fe-el fe-tick" data-k="12"><span>BTC/KES <em class="up">▲ 2.1%</em></span><span>USD/KES <em class="dn">▼ 0.3%</em></span></div>
          <div class="fe-el fe-send" data-k="13">Send money →</div>
          <div class="fe-el fe-list" data-k="14"><i></i><i></i></div>
        </div>
        <div class="fe-scores"><span><b>98</b>Perf</span><span><b>100</b>A11y</span><span><b>100</b>Best</span><span><b>100</b>SEO</span></div>`,
      init(w, st) {
        const els = $$('.fe-el', w);
        const page = $('.fe-page', w);
        st.onStart = (i) => {
          if (i === 0) { els.forEach((e) => e.classList.remove('on')); page.classList.remove('styled'); w.classList.remove('scored'); }
        };
        st.onLine = (i, n) => { if (i === 0) els.forEach((e) => { if (n >= +e.dataset.k) e.classList.add('on'); }); };
        st.onDone = (i) => {
          if (i === 0) { els.forEach((e) => e.classList.add('on')); w.classList.add('scored'); }
          if (i === 1) page.classList.add('styled');
        };
      },
    },
    tests: {
      html: `<div class="wg-head"><span class="wg-title">go test -race</span><span class="wg-pill ok">PASS</span></div>
        <ul class="be-tests"></ul>
        <div class="be-traffic"><canvas></canvas><span class="be-meta">rps <b class="be-rps">12.4k</b> · p99 <b class="be-p99">38ms</b></span></div>`,
      init(w, st) {
        const list = $('.be-tests', w);
        const TESTS = ['TestSend_Success', 'TestSend_InsufficientFunds', 'TestSend_Idempotent', 'TestLedger_Balanced', 'TestMomoPush_Timeout', 'TestRateLimit_Burst', 'TestMigration_0042', 'TestReceipt_Signature'];
        let t = 0;
        st.onLine = () => {
          const li = document.createElement('li');
          li.innerHTML = `<span class="ok">--- PASS</span> ${TESTS[t++ % TESTS.length]} <em>(0.0${randi(1, 9)}s)</em>`;
          list.appendChild(li);
          while (list.children.length > 4) list.removeChild(list.firstChild);
        };
        const cv = $('canvas', w);
        const ctx = cv.getContext('2d');
        const series = Array.from({ length: 48 }, () => rand(0.4, 0.7));
        let acc = 0;
        const rpsEl = $('.be-rps', w), p99El = $('.be-p99', w);
        addLoop(w, (now, dt) => {
          acc += dt;
          if (acc < 120) return;
          acc = 0;
          series.push(Math.min(0.95, Math.max(0.15, series[series.length - 1] + rand(-0.12, 0.12))));
          series.shift();
          const [W, H] = sizeCanvas(cv, ctx);
          ctx.clearRect(0, 0, W, H);
          const path = () => { ctx.beginPath(); series.forEach((v, i) => { const x = (i / (series.length - 1)) * W, y = H - v * H; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); };
          const g = ctx.createLinearGradient(0, 0, 0, H);
          g.addColorStop(0, 'rgba(243,208,126,.35)');
          g.addColorStop(1, 'rgba(243,208,126,0)');
          path(); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
          path(); ctx.strokeStyle = '#f3d07e'; ctx.lineWidth = 1.6; ctx.stroke();
          const last = series[series.length - 1];
          rpsEl.textContent = (8 + last * 8).toFixed(1) + 'k';
          p99El.textContent = Math.round(30 + (1 - last) * 18) + 'ms';
        });
      },
    },
    emulator: {
      html: `<div class="emu-phone"><div class="emu-screen">
          <div class="emu-top"><span>🔥 12</span><span class="emu-xp-total">340 XP</span></div>
          <div class="emu-lang">Kiswahili · Lesson 3</div>
          <div class="emu-prog"><i></i></div>
          <div class="emu-q"></div>
          <div class="emu-opts"></div>
          <div class="emu-xp">+10 XP</div>
        </div></div>
        <div class="emu-side">
          <div class="wg-head"><span class="wg-title">flutter run</span><span class="wg-pill">debug</span></div>
          <div class="emu-dev">Pixel 8 · Android 15</div>
          <div class="emu-meter"><span>Build</span><div class="emu-bar"><i class="emu-build"></i></div></div>
          <div class="emu-meter"><span>Frame</span><b class="emu-fps">60 fps</b></div>
          <div class="emu-meter"><span>Memory</span><b class="emu-mem">84 MB</b></div>
        </div>`,
      init(w) {
        const Q = [
          ['Habari yako?', ['Good night', 'How are you?', 'Thank you', 'Goodbye'], 1],
          ['Asante sana', ['Thank you very much', 'Welcome', 'See you later', 'Good morning'], 0],
          ['Karibu', ['Friend', 'Sorry', 'Welcome', 'Water'], 2],
          ['Rafiki', ['Teacher', 'Friend', 'School', 'Market'], 1],
        ];
        const qEl = $('.emu-q', w), oEl = $('.emu-opts', w), xp = $('.emu-xp', w), total = $('.emu-xp-total', w), prog = $('.emu-prog i', w);
        const build = $('.emu-build', w), fps = $('.emu-fps', w), mem = $('.emu-mem', w);
        let qi = 0, xpTotal = 340, visible = false, timer = null;
        function show() {
          const [q, opts, ok] = Q[qi % Q.length];
          qEl.textContent = q;
          oEl.innerHTML = opts.map((o) => `<b>${o}</b>`).join('');
          xp.classList.remove('pop');
          prog.style.width = (((qi % Q.length) + 1) / Q.length) * 100 + '%';
          timer = setTimeout(() => {
            oEl.children[ok].classList.add('pick');
            setTimeout(() => {
              oEl.children[ok].classList.add('correct');
              xp.classList.add('pop');
              xpTotal += 10;
              total.textContent = xpTotal + ' XP';
            }, 380);
            timer = setTimeout(() => { qi++; if (visible) show(); else timer = null; }, 2200);
          }, 1300);
        }
        onVisible(w, (v) => { visible = v; if (v && !timer) show(); });
        let b = 0;
        addLoop(w, (now, dt) => {
          b = (b + dt / 60) % 120;
          build.style.width = Math.min(100, b) + '%';
          if (Math.random() < 0.05) fps.textContent = (Math.random() < 0.9 ? 60 : 58) + ' fps';
          if (Math.random() < 0.03) mem.textContent = randi(78, 92) + ' MB';
        });
      },
    },
    training: {
      html: `<div class="wg-head"><span class="wg-title">pronunciation-coach</span><span class="wg-pill ai-epoch">epoch 1/10</span></div>
        <div class="ai-chart"><canvas></canvas><span class="ai-legend"><i class="l"></i>loss <i class="a"></i>accuracy</span></div>
        <div class="ai-gpus"><div><span>GPU0</span><b><i></i></b></div><div><span>GPU1</span><b><i></i></b></div><div><span>GPU2</span><b><i></i></b></div><div><span>GPU3</span><b><i></i></b></div></div>`,
      init(w) {
        const cv = $('canvas', w), ctx = cv.getContext('2d');
        const ep = $('.ai-epoch', w);
        const bars = $$('.ai-gpus i', w);
        let pts = [], acc = 0, k = 0;
        addLoop(w, (now, dt) => {
          acc += dt;
          bars.forEach((bar, i) => { bar.style.width = (78 + Math.sin(now / 400 + i * 1.3) * 12 + rand(-3, 3)).toFixed(0) + '%'; });
          if (acc < 260) return;
          acc = 0;
          if (pts.length >= 40) { pts = []; k = 0; }
          k++;
          const t = k / 40;
          pts.push([2.2 * Math.exp(-4 * t) + 0.18 + rand(-0.06, 0.06), 0.97 - 0.62 * Math.exp(-5 * t) + rand(-0.02, 0.02)]);
          ep.textContent = `epoch ${Math.min(10, Math.ceil(k / 4))}/10`;
          const [W, H] = sizeCanvas(cv, ctx);
          ctx.clearRect(0, 0, W, H);
          ctx.strokeStyle = 'rgba(255,255,255,.06)';
          ctx.lineWidth = 1;
          for (let y = 0; y <= 4; y++) { ctx.beginPath(); ctx.moveTo(0, (y / 4) * H); ctx.lineTo(W, (y / 4) * H); ctx.stroke(); }
          const line = (idx, max, col) => {
            ctx.beginPath();
            pts.forEach((p, i) => { const x = (i / 39) * W, y = H - (p[idx] / max) * H * 0.9 - 3; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
            ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.shadowColor = col; ctx.shadowBlur = 6; ctx.stroke(); ctx.shadowBlur = 0;
          };
          line(0, 2.5, '#d9a548');
          line(1, 1, '#f3d07e');
        });
      },
    },
  };

  /* ---------------------------------------------------------
     Build stations
     --------------------------------------------------------- */
  $$('.station').forEach((station) => {
    const key = station.dataset.station;
    const c = STATIONS[key];
    const scene = $('.station-scene', station);
    if (!c || !scene) return;
    const W = WIDGETS[c.widget];
    station.style.setProperty('--hc', c.hc);

    scene.innerHTML = `
      <div class="ws">
        <div class="ws-bar">
          <span class="wg-dots"><i></i><i></i><i></i></span>
          <span class="ws-title">${c.user}@pizzatech <em>~/${c.repo}</em></span>
          <span class="ws-live"><i></i> LIVE</span>
        </div>
        <div class="ws-editor">
          <div class="ws-tabs"><span class="ws-tab"></span><span class="ws-lang"></span></div>
          <div class="ws-code"><div class="ws-gutter">1</div><pre class="ws-pre"><code></code></pre></div>
          <div class="ws-status"></div>
        </div>
        <div class="ws-bottom">
          <div class="ws-widget wg-${c.widget}">${W.html}</div>
          <div class="ws-term"></div>
        </div>
      </div>`;

    const tab = $('.ws-tab', scene), langEl = $('.ws-lang', scene), status = $('.ws-status', scene);
    const gutter = $('.ws-gutter', scene), pre = $('.ws-pre', scene), term = $('.ws-term', scene);
    const widget = $('.ws-widget', scene);
    const hooks = {};
    W.init(widget, hooks);

    const log = (html) => {
      const d = document.createElement('div');
      d.innerHTML = html;
      term.appendChild(d);
      while (term.children.length > 6) term.removeChild(term.firstChild);
    };

    let snippetIdx = 0;
    const typer = new Typer(pre, {
      watch: station,
      speed: [22, 62],
      onLine: (n) => {
        let s = '';
        for (let i = 1; i <= n; i++) s += i + '\n';
        gutter.textContent = s;
        gutter.scrollTop = pre.scrollTop;
        if (hooks.onLine) hooks.onLine(snippetIdx, n);
      },
    });

    (async function loop() {
      let i = 0;
      await typer.pause(rand(200, 1200));
      for (;;) {
        snippetIdx = i % c.snippets.length;
        const sn = c.snippets[snippetIdx];
        typer.clear();
        gutter.textContent = '1';
        tab.textContent = sn.file;
        langEl.textContent = sn.label;
        status.innerHTML = `<span class="dot"></span> typing · ${sn.label} · UTF-8`;
        if (hooks.onStart) hooks.onStart(snippetIdx);
        log(`<span class="pr">$</span> ${sn.cmd}`);
        sn.out.forEach((o) => log(`<span class="mu">${o}</span>`));
        station.classList.add('typing');
        await typer.type(sn.code, sn.lang);
        station.classList.remove('typing');
        status.innerHTML = `<span class="ok">${sn.done}</span>`;
        log(`<span class="ok">${sn.done}</span>`);
        if (hooks.onDone) hooks.onDone(snippetIdx);
        if (REDUCED) break;
        await typer.pause(3000);
        i++;
      }
    })();
  });
})();
