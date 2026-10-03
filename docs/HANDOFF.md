# HANDOFF — specimens, lounge, QA (for the Sonnet builder)

Built (design phase): tokens/base/components/pages CSS, fonts (`css/fonts.css`, `assets/fonts/`),
all SVG art (`js/components/illustrations.js`), `index.html` + `js/main.js`, `project.html` + `js/project.js`.
Three.js r170 is ALREADY vendored: `vendor/three/three.module.min.js`, `addons/{effects/OutlineEffect,
geometries/RoundedBoxGeometry,utils/BufferGeometryUtils}.js` (import map: `three` → that file, `three/addons/` → `vendor/three/addons/`).

## Specimen mount contract
- `project.js` lazy-imports `js/specimens/<key>.js` when `.specimen[data-specimen=KEY]` nears the viewport
  and calls `mount(el, project, { reduced })`.
  - `el`: the `.specimen` div (min-height 360px, position:relative) inside `.specimen-frame`; it starts
    with a `.specimen__placeholder` child — remove it (`el.replaceChildren(node)`) when you render.
  - `project`: the PROJECTS entry (use `facts`, `title`, etc.; never invent numbers).
  - `reduced`: true under prefers-reduced-motion → no autoplay loops; render final state / step buttons.
  - Return an optional cleanup fn. Catch your own errors; zero console errors is a ship gate.
- Keys/files: entropy, wordsearch, minimap, bullet, sabre, emote-go, emote-chat, emote-cli (stubs
  with a one-line TODO each describing SPEC §4 behaviour). Build with `html` from `js/util/html.js`
  (SVG only via `.innerHTML` strings); canvas sized with devicePixelRatio; keyboard operable.

## Classes & tokens a specimen should use
- Colours: `--paper --paper-2 --ink --ink-2 --ink-3 --blue --blue-deep --red` (red = live/interactive marks
  only; blue is a fill, never text on paper). Canvas: read via `getComputedStyle(document.documentElement)`.
- Type: `--f-cond` (caps labels), `--f-mono` (readouts), `--f-body`, `--f-display`.
- Ready-made: `.btn`, `.btn--ghost`, `.go`, `.tags`, `.live-dot`, `.mono`, `.caps`, `.chamfer` (+`.chamfer__title`),
  `.facts` (dl), `.roundel`, halftone tokens `--halftone-blue/--halftone-ink`. Terminal-style panels: use the band
  locals `--band --band-2 --on-band --on-band-2 --band-rule` (e.g. emote-go/cli).
- Add specimen CSS to `css/components.css` under a `/* specimen: <key> */` block, prefixed `.sp-<key>`.

## Remaining TODOs
1. Implement the 8 specimens (SPEC §4). Minimap reads `.article-body` blocks and scrolls the window.
2. `lounge.html` placeholder: masthead, split-flap "NOW BOARDING" (reuse `Flaps` + `runFlaps` from
   `js/components/board.js`), "under construction", link back; later the Three.js scene (SPEC §5).
3. QA: serve `python3 -m http.server 8765` from `portfolio/`; screenshot 1440 + 390 (390 needs the iframe
   harness — headless clamps to 500px; pass `--force-prefers-reduced-motion` so reveals show); console check on
   index + all 8 chapters; check no horizontal scroll at 360px; refresh `docs/screens/`.
4. Nice-to-have (SPEC §7, optional): altimeter/heading cursor readout; `data-depth` parallax hook exists in
   `js/util/motion.js` but nothing is tagged yet.
