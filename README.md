# Pizza Technologies — company website

An animated, immersive single-page website and portfolio for **Pizza Technologies**, a pan-African software studio and academy for cyber security and coding, founded by **Keith Baraka Kaunda**.

There's no build step and no framework. It's plain HTML, CSS and vanilla JavaScript, and every illustration is hand-built SVG or canvas, so it loads fast and deploys to any static host.

## What's on the page

| Section | What it does |
| --- | --- |
| **Preloader** | The logo draws itself (ring, orbiting dots, slice, wordmark) while a terminal "bakes" the site |
| **Hero** | Code-rain canvas, a procedural *circuit pizza* with electrons flowing along its traces, a slice that pulls away with cheese strings, 3D-orbiting tech tags and mouse parallax |
| **Studio** | A manifesto that lights up word by word as you scroll, plus animated counters |
| **The Kitchen** | Four live engineering workstations over an animated circuit board. Each has an IDE typing real code for our products plus a live tool panel: browser preview with performance scores, Go test runner with a traffic graph, Lugha Yetu on a device emulator, and an AI training chart with GPU telemetry |
| **Live Build** | An IDE types a component tree while a phone assembles the matching UI piece by piece, then deploys with confetti. It alternates between Aurex and Lugha Yetu |
| **The Menu** | Services as 3D-tilt cards with animated icons and rotating gradient borders |
| **Academy** | Cyber security and coding training tracks, with a live *cyber range*: a shield blocks incoming attacks while a threat log streams |
| **The Book** | A 3D rotating book of *The Silicon Savannah Fortress: Where African Innovation Meets Digital Security* by Keith Baraka Kaunda, on a circuit-board backdrop |
| **Systems** | A live architecture diagram with request packets flowing between services, plus metrics, a sparkline and logs |
| **The Recipe** | A pizza that assembles itself layer by layer as you scroll through the six-step process |
| **Reach** | A draggable dotted globe with Africa lit up and data arcs to cities worldwide |
| **Portfolio** | Published games (Pizza Stack, Tennis Mayhem, Cloudy Park Untamed), each with a live animated scene, plus 8 coming-soon products: Lugha Yetu, Mfanyikazi & Msaidizi, Amber, Aurex, TenantFlex, Ecclesia, Elimu Yetu and Ojo Sentinels |
| **Order** | A pizza-order-style contact form with an animated Order → Plan → Build → Ship pipeline. It hands the enquiry to the visitor's email app |

All animation pauses when it's offscreen. `prefers-reduced-motion` is respected. The layout works from 320px phones up to large desktops.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Opening `index.html` directly from disk also works.

## Configure

Edit the values at the top of `assets/js/core.js`:

```js
const CONFIG = {
  CONTACT_EMAIL: 'hello@pizzatechnologies.com', // where order tickets & enquiries go
  BOOK_URL: '',                                 // store link for "The Silicon Savannah Fortress"
  GAME_LINKS: { pizzaStack: '', tennisMayhem: '', cloudyPark: '' }, // store / play links
};
```

- `CONTACT_EMAIL` is a placeholder, so set your real inbox.
- While `BOOK_URL` is empty, "Get your copy" opens an email request instead of a store link.
- A **Play now** button appears on each game card once its link is set.

## Things to personalise

- **Social links** in the footer point to `#`. Add your GitHub, LinkedIn, X and Instagram URLs in `index.html`.
- **Projects and games**: edit the `.project` and `.game` cards in `index.html`. Game genres and blurbs are written from the game titles, so adjust them to match the real games.
- **Book cover**: the 3D book uses a vector recreation of the cover. To use the original photo, save it as `assets/img/book-cover.jpg` and replace the `<svg class="book-cover" …>…</svg>` inside `.book-front` with `<img class="book-cover" src="assets/img/book-cover.jpg" alt="">`.
- **Team photos**: the Kitchen shows workstations rather than people. To feature your engineers, add photos to `assets/img/` and place them in the `.station-info` blocks.
- **Academy tracks**: modules and tools are listed in the `#academy` section of `index.html`.
- **Logo**: `assets/img/logo.svg` is a vector recreation of the brand mark. The same artwork sits inline at the top of `index.html` (`#ptEmblemG`) for the nav, preloader and book cover.
- **Workstation code** lives in `assets/js/coders.js` (`STATIONS`). The Live Build apps are in `assets/js/livebuild.js` (`APPS`).

## Structure

```
index.html              page markup + inline logo sprite
assets/css/style.css    all styles (tokens at the top)
assets/js/core.js       config, shared animation loop, syntax highlighter, typing engine
assets/js/tech.js       procedural circuit-board backgrounds with signal pulses
assets/js/hero.js       code rain, circuit pizza, orbiting tags, hero terminal
assets/js/coders.js     live engineering workstations (IDE + tool panels)
assets/js/livebuild.js  IDE ↔ phone live build
assets/js/academy.js    cyber range, training CTA, 3D book
assets/js/systems.js    architecture diagram + metrics
assets/js/process.js    scroll-assembled pizza
assets/js/globe.js      dotted globe with arcs
assets/js/main.js       preloader, nav, cursor, reveals, tilt, projects, form
assets/img/             logo + favicon
```

## Deploy

It's a static site, so any static host works:

- **GitHub Pages**: Settings → Pages → deploy from the branch root.
- **Netlify, Vercel or Cloudflare Pages**: no build command, publish directory `/`.
- **Render**: new *Static Site*, build command empty, publish directory `.`.
