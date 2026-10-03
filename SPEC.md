# SPEC — "Technology Facts and Figures, 2026" · Rozario Chivers portfolio

Governing spec for the new portfolio in `portfolio/`. Supersedes `BRIEF.md` / `site/` (the old site is
reference for copy only — do not copy its code, CSS or look). Audience: hiring boards, founders and
investors evaluating Roz as a **CTO, innovator, AI + agentic-engineering leader** who still builds.

## 1. Concept
The site is a fictional companion volume to the 1958 almanac in
`Reference/aviation-facts-and-figures-1958.pdf` (137 pp — render pages with
`pdftoppm -r 50 -f N -l N` to study them; do not embed scans). Title on the cover:
**ROZARIO CHIVERS · TECHNOLOGY FACTS AND FIGURES, 2026**. Each project is a numbered *chapter*.
The interactive bonus is **"The Skyport of Tomorrow"** — a Three.js 1958-imagines-2062 airport lounge
(Jetsons register) where you walk a character between futuristic monitors, each showing a project.

## 2. Visual system (print-limited, 1957→60s transition)
- **Inks, not colours.** Paper `#F1ECDF` (warm stock), Ink `#161616`, Sky Blue spot `#7DB6D8`
  (with darker over-print `#4F8DB3`), one sparing Signal Red `#C8452E` for live/interactive marks only.
  Never gradients except halftone. Slight mis-registration (1–2px offset of blue fill vs ink line) is a
  deliberate motif on illustrations and chapter plates.
- **Texture:** subtle paper grain (SVG feTurbulence, low opacity) + halftone dot screens
  (CSS radial-gradient patterns) for tints, as in the "General Aviation" plate.
- **Design elements to reproduce** (see 4 reference crops in the brief): chapter plate = blue band with
  flared-serif title + solid black block holding an **outlined condensed numeral**; clipped-corner
  (chamfered) blue info panels; bar charts with black/white reversed bars and condensed caps labels
  ("1957 IN MILLIONS OF PASSENGER MILES"); white circle title roundels overlapping illustrations;
  running page header "98   TECHNOLOGY FACTS AND FIGURES, 2026" in spaced small caps.
- **Illustration:** original inline SVG in high-contrast monochrome ink — bold black fills, brush
  shadows, confident contour lines, figures in suits/hats, propeller planes, rocket ships, saucers,
  skylines; flat blue shapes behind, offset. Hand-drawn feel (slightly irregular paths, `stroke-linecap:round`).
  No stock photos.
- **Type (self-host woff2 in `assets/fonts/`, fetch from Google Fonts once with curl):**
  Display flared serif **Marcellus** (chapter titles, à la "General Aviation"); condensed caps
  **Oswald** 500/700 (labels, bars, numerals — outlined numerals via `-webkit-text-stroke`);
  body geometric **Jost** 400/500 (Futura/Twentieth-Century stand-in); mono for tech readouts
  **IBM Plex Mono**. Generous letter-spacing on caps, tight leading on display, hanging punctuation.
- **Motion:** split-flap departure board, gentle parallax of illustrated layers, bars that "print in"
  on scroll, slow-drifting saucers. Respect `prefers-reduced-motion` everywhere.

## 3. Information architecture
1. `index.html`
   - **Cover**: almanac cover composition — big Marcellus title, edition line, ink illustration
     (Roz-as-1958-businessman walking from a rocket, blue offset shapes, skyline). Running header.
   - **Departures board** (split-flap, Canvas or DOM): each project is a "flight":
     FLIGHT `EG-01` · DESTINATION `ENTROPY GRID` · GATE · STATUS `BOARDING`/`ON TIME`. Clicking a row
     opens the chapter. Ticker strip beneath with capability phrases.
   - **Chapters** grid: one panel per project with chapter plate (numeral + title), small ink
     illustration, one-line standfirst, tech tags → `project.html?p=<slug>`.
   - **Facts & Figures** (bar-chart page in the 1957 style) using ONLY numbers from the CV
     (e.g. 50,000+ training images, 6 genera, 5,710 specialists, ~5.8 MB model, teams up to 100,
     82–91% gross margin, 1.8M app downloads 2007, 30 years since 1996). Label the source.
   - **The Pilot** (about): CTO profile, career timeline as a flight route map (SVG dotted arcs,
     employers as airports: Mould Detect, BrikIQ, TAL, QBE, Macquarie, GBST, icare, earlier 1996–2017),
     capability grid from the CV skills summary.
   - **Skyport CTA**: invitation card into `lounge.html`.
   - **Contact**: LinkedIn, Behance, GitHub, email `rozario@fastmail.com`.
2. `project.html?p=<slug>` — one article template rendering from data: chapter plate, standfirst,
   live **interactive specimen** (see §4), body sections, "Facts" sidebar (chamfered blue panel),
   links (Live / Source), prev/next chapter.
3. `lounge.html` — Skyport of Tomorrow (§5).

## 4. Projects (slugs; content lives in `js/data/projects.js`)
| # | slug | url | specimen idea (Canvas/DOM, small, self-contained) |
|---|---|---|---|
| 1 | entropy-grid | https://flipflop.github.io/Entropy-Grid/ | grid of cells lit by random bits; optional "Use microphone" button (getUserMedia → LSB of preamp noise) else crypto.getRandomValues; drag a "plant" onto the grid and show a cluster heat overlay — explain honestly it's a thought experiment |
| 2 | wordsearch-ps | http://flipflop.github.io/WordSearchPS/ | playable mini word-search of Roz's skills |
| 3 | minimap-js | https://flipflop.github.io/minimap-js/ | live minimap of the article itself, draggable viewport |
| 4 | css-bullet-graph | http://flipflop.github.io/CSSBulletGraph/ | animated bullet graphs (Stephen Few) of capabilities |
| 5 | sabre-wulf-vic20 | https://flipflop.github.io/sabre-wulf-vic20/ | VIC-20 palette pixel jungle maze, arrow-key mini-walk |
| 6 | emote-go | https://github.com/flipflop/emote-go | terminal panel streaming emotes |
| 7 | emote-chat | https://github.com/flipflop/emote-chat | two-pane chat demo |
| 8 | emote-cli | https://github.com/flipflop/emote-cli | typed CLI session |
Facts in articles must come from the repos/pages themselves (READMEs, source) or the supplied brief —
**never invent** dates, stars, users or metrics. Mould Detect may appear as a featured "current
command" panel using CV facts only.

Data shape (contract between agents — do not change without updating this file):
```js
export const PROJECTS = [{
  n: 1, slug: 'entropy-grid', flight: 'EG-01', title: 'Entropy Grid',
  year: '2026', kind: 'Hardware entropy · Canvas', status: 'ON TIME',
  live: 'https://…', source: 'https://github.com/flipflop/…',
  standfirst: '≤ 30 words', tags: ['Web Audio', 'Canvas', …],
  facts: [['Entropy source', 'Johnson–Nyquist noise'], …],   // 3–6 rows
  body: [{ h: 'Section heading', p: ['para', 'para'] }, …],  // 300–600 words total
  pull: 'one pull quote',
  specimen: 'entropy',  // key into js/specimens/*.js
  capability: 'what this shows about Roz as CTO/innovator, one sentence'
}];
export const PROFILE = { … }; export const CAREER = [ … ]; export const FIGURES = [ … ];
export const TICKER = [ … ]; export const LINKS = { linkedin, behance, github, email };
```

## 5. Skyport of Tomorrow (`lounge.html`)
Three.js (vendored ES module in `vendor/three/`, no CDN). Look = the print system in 3D:
`MeshToonMaterial` with 2–3 step gradient map, ink outlines (inverted-hull or `OutlineEffect`), palette
restricted to paper/ink/blue/red, halftone/grain screen-space overlay. Scene: circular googie lounge
on a pylon above a cloud sea; boomerang tables, starburst lamps, a glass dome; outside, a cloud-top city
of needle towers and saucer platforms with rocket ships and saucers drifting on paths. Character:
simple stylised 1950s traveller (capsule body, hat) — WASD/arrows + click-to-walk, touch joystick on
mobile, follow camera. 8 monitors on swan-neck stands (one per project) show a canvas-texture
"broadcast" card; walk up + press E/tap → overlay panel with standfirst and "Read chapter" link.
Ambient: departure chime, PA ticker (muted by default, toggle). Loading screen = split-flap
"NOW BOARDING". Fallback: if WebGL unavailable or reduced-motion, show the static chapter list.
Keep it under ~1 MB of JS + assets; procedural geometry only (no model downloads).

## 6. Engineering rules
- Build-free vanilla ES modules; components are pure functions returning template-literal HTML
  (idiom: `Reference/roz-template-literal-example.html`, skill `vanilla-js-idiomatic-react`).
  All copy in `js/data/*.js`. Tokens in `css/tokens.css`.
- Layout: `index.html`, `project.html`, `lounge.html`, `css/{tokens,base,components,pages}.css`,
  `js/{main,project,lounge}.js`, `js/components/*.js`, `js/specimens/*.js`, `js/data/*.js`,
  `assets/{fonts,svg}/`, `vendor/three/`.
- No external runtime requests (fonts/three vendored). Semantic HTML, WCAG AA contrast (blue is a
  fill, never body-text colour on paper), keyboard reachable, alt text / aria on SVG. Mobile-first,
  no horizontal scroll at 360px. Lighthouse-sane: lazy-init specimens with IntersectionObserver.
- Serve locally with `python3 -m http.server` from `portfolio/`; verify with headless Chrome
  screenshots (desktop 1440 and mobile 390) and zero console errors before reporting done.

## 7. Foundation template (user-supplied, optional)
`Reference/Roz-Simeng-Li-Website/` (Sylan Advisory "drafting sheet" build: hairline grid cells, ticker,
boot preloader, cursor readouts, scroll reveal, theme toggle). Reuse its *behaviours and structure*
(`js/{preloader,ticker,cursor,reveal,nav}.js`, the hairline-grid layout discipline) as a starting point,
ported to the component idiom — but re-skin completely to §2. Preloader becomes the split-flap
"NOW BOARDING"; cursor readout becomes an altimeter/heading readout; hairline grid becomes the almanac
page margins and column rules. Do not carry over its imagery, logos, colours or copy.
