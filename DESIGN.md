# DESIGN.md — *Technology Facts and Figures, 2026*

The design system behind rozariochivers.com. Tokens live in `css/tokens.css`; every rule below
can be traced to a token, a component in `js/components/`, or a CSS block named here.

---

## 1. Concept

The site is a fictional companion volume to *Aviation Facts and Figures, 1958*, a small industry
almanac printed with two inks on warm stock. The conceit gives every design decision a test:
**could a 1958 printer have produced this, and if not, does it read as 1958 imagining the future?**

- Projects are **numbered chapters** with chapter plates, like the almanac's section openers.
- Facts are set as **almanac tables and bar charts** ("Impact and ROI").
- The career is a **flight route chart**; the homepage index is a **departures board**.
- The 3D lounge is *1958 imagining 2062*: the Jetsons-era future, rendered in the same two inks.

The period sits at the turn from 1950s commercial illustration into early-60s Swiss-influenced
typography, so the system mixes a flared display serif and confident ink drawing with condensed
grotesque labels and tight grids.

### Restraint rules
1. **Inks, not colours.** Everything is paper, ink, one spot blue and a sparing red.
2. **No gradients** except halftone screens. No drop shadows; depth comes from mis-registration.
3. **Show, don't tell.** No self-promotional copy blocks; the work and the specimens carry the case.

---

## 2. Palette: a two-ink press plus a spot

| Token | Hex | Role | Contrast on paper |
|---|---|---|---|
| `--paper` | `#F1ECDF` | warm uncoated stock, page ground | n/a |
| `--paper-2` | `#E8E1CF` | tinted stock for inset panels, code | n/a |
| `--paper-3` | `#DCD3BD` | soft rules | n/a |
| `--ink` | `#161616` | text, line art, solid blocks | 16:1 |
| `--ink-2` | `#3A3833` | secondary text | 10:1 |
| `--ink-3` | `#5E5A50` | meta, captions | 6:1 |
| `--blue` | `#7DB6D8` | the spot colour: fills, panels, offsets | **fill only, never text on paper** |
| `--blue-deep` | `#4F8DB3` | over-print where blue overlaps blue | fill only |
| `--red` | `#C8452E` | live / interactive marks only (live dot, focus ring, current role, stamps) | used for marks, not reading text |

**Bands** (the Mould Detect command band, dark panels) are dark in every theme and read only
their own locals: `--band`, `--band-2`, `--on-band`, `--on-band-2`, `--band-rule`. Page tokens
are never used inside a band, so a band can never invert and lose its text.

The site is a single light "printed" theme by design; `color-scheme: light` is declared, and the
browser chrome tint follows the OS via two `theme-color` metas.

---

## 3. Typography

| Face | Token | Role | Why |
|---|---|---|---|
| **Marcellus** | `--f-display` | titles, chapter names, pull quotes, card titles | A flared, inscriptional serif: the closest free match to the almanac's "General Aviation" display lettering |
| **Oswald** 500/700 | `--f-cond` | caps labels, kickers, nav, numerals, bar labels | Condensed grotesque of 1950s data tables; carries outlined numerals well |
| **Jost** 400/500 | `--f-body` | body copy | Geometric sans in the Futura / Twentieth Century line used in period ads |
| **IBM Plex Mono** 400/500 | `--f-mono` | readouts, captions, code, specimen terminals | Technical register for the "instrument" parts of the page |

- Self-hosted woff2, Latin subset, `font-display: swap` (`css/fonts.css`). No third-party requests.
- **Scale:** `--t-xs` 0.75rem → `--t-3xl` fluid `clamp(2.8rem, 1.2rem + 6vw, 7.2rem)`. Display sizes are fluid; body is fixed at 1.0625rem for a steady measure.
- **Tracking:** caps at `--caps-track` 0.14em, wide labels at `--wide-track` 0.28em (letter-spaced small caps, as in the running heads).
- **Measure:** `--measure: 62ch` for reading text.
- **Outlined numerals:** chapter numbers and figure tiles use Oswald with `-webkit-text-stroke` and a transparent fill, offset by a blue shadow (see §5).
- **Drop caps** open article bodies (Marcellus initial set into a blue block).
- `text-wrap: balance` on headings, `pretty` on paragraphs.

---

## 4. Layout and page furniture

- **Page:** `--page-max: 1240px`, gutters `clamp(16px, 4vw, 56px)`, 8px spacing scale `--s-1…--s-9`.
- **Running heads:** every section opens with a folio and "TECHNOLOGY FACTS AND FIGURES, 2026" in wide-tracked caps over a rule, alternating left/right like printed spreads; page numbers follow the contents list.
- **Contents list** ("In this edition") with dotted leaders and folios on the cover.
- **Chapter plate:** a blue band with the Marcellus title and a solid ink block holding an outlined numeral. Used on panels, article heroes, and prev/next navigation.
- **Chamfer panel** (`.chamfer`): blue panel with clipped corners via `clip-path` polygon and an ink title strip. Used for "Facts of the flight", "Log of the command" and the lounge overlay.
- **Roundel:** a paper circle that overlaps an illustration or chart, as on the almanac cover.
- **Rules** are always 1px ink (`--rule`) or 3px ink for section starts; never grey borders.

---

## 5. Print effects: halftone, grain, mis-registration

All effects imitate offset lithography. None uses a blur or a shadow.

### Paper grain
A fixed full-viewport overlay (`body::after` in `base.css`): an SVG `feTurbulence` fractal-noise
filter as a data URI, `opacity: .28`, `mix-blend-mode: multiply`, `pointer-events: none`. It sits
over everything so photos, canvases and the 3D page all read as printed on the same stock.

### Halftone screens (CSS)
Tokens in `tokens.css`, applied as backgrounds:
```css
--halftone-blue:  radial-gradient(circle, var(--blue-deep) 0 1.3px, transparent 1.6px) 0 0 / 6px 6px;
--halftone-ink:   radial-gradient(circle, var(--ink) 0 1px, transparent 1.3px) 0 0 / 5px 5px;
--halftone-paper: radial-gradient(circle, rgba(241,236,223,.35) 0 1px, transparent 1.3px) 0 0 / 5px 5px;
```
Used for tints on illustrations (class `hb`/`hk` in SVG), the command band's top fade, and the TV screen.

### Halftone photographs (pre-rendered)
`assets/photos/halftone.py` converts photos into two-ink prints at build time, not in the browser:
1. greyscale, autocontrast, unsharp mask, gamma lift so slide text stays legible;
2. a **45° ink dot screen**: dot size from luminance, threshold
   `0.5 − 0.25·(cos 2πu/p + cos 2πv/p)` over rotated coordinates (pitch `p` ≈ 4–5px);
3. a flat **blue under-print** from a posterised mid-tone mask, offset 3–5px out of register.

Event photos use both inks; the profile portrait uses ink only (blue made the face muddy) inside a
circle with an ink rim and a blue offset ring.

### Mis-registration
The signature move. A flat blue shape is printed slightly off the ink line (`--mis-x: 4px`,
`--mis-y: -3px`, or 6–10px on large figures): `box-shadow: 6px -5px 0 var(--blue)` on frames and
screenshots, a translated blue `<rect>` behind each illustration, a blue `text-shadow` on outlined
numerals. It reads as two plates that did not quite line up, which replaces drop shadows entirely.

### SVG filters (illustration)
Defined once in `ArtDefs` (`illustrations.js`):
- `#rough`: `feTurbulence` + `feDisplacementMap`, a slight hand wobble on ink lines.
- `#brush`: a stronger displacement for the **torn-edge** flat blue shapes behind figures.

---

## 6. Illustration

- **Style:** high-contrast monochrome ink, bold black fills, brush shadows, confident contour lines,
  flat offset blue shapes behind, halftone for mid-tones. Figures in suits and hats, propeller
  planes, rockets, saucers, needle towers.
- **Sources:** original SVG drawn in code for the site (cover, vignettes, saucers, phone, diagrams)
  plus public-domain/CC0 figures recoloured to `#161616` with white fills removed so paper shows
  through (`assets/illustrations/`, credited in `CREDITS.md`). A traced paper silhouette sits
  behind line-art figures so background lines do not show through them.
- **No artwork from the 1958 book is reproduced**; it is a style reference only (copyright unverified).
- **Diagrams** (`diagrams.js`) follow the same inks: ink boxes, blue reading blocks, a red path for
  the decision that matters, numbered nodes, square-on arrowheads, a mis-registered frame.

---

## 7. Components and UI controls

| Component | Behaviour |
|---|---|
| **Departures board** | Each project is a flight row (`EG-01 · ENTROPY GRID · GATE · ON TIME`) rendered as split-flap cells that riffle to their text on first view; a live Sydney clock. Rows are links. |
| **Ticker** | Blue band of capability phrases in a seamless marquee (content duplicated). Pauses on hover/focus; static under reduced motion. |
| **Buttons** | `.btn`: ink block, paper caps, blue offset on hover. `.btn--ghost`: ink outline. `.btn--band`: paper on dark bands. `.go`: text link with an animated arrow. Minimum hit area 44px. |
| **Live dot** | Small red dot that blinks in two steps (no fade) to mark "live". |
| **Toggles** | Mode buttons use `aria-pressed`; the pressed state is solid ink with the blue offset. |
| **Charts** | Reversed black bars with paper value cells and knocked-out labels; log scale is labelled when used. The innovation chart uses solid numerals and bars scaled to the largest count. |
| **Specimens** | One per chapter, lazy-loaded when near the viewport (`IntersectionObserver`), each in a framed "Specimen No. N · Live" panel. |
| **Route map** | Straight ink legs; a plane animates along the route once on first view, rings pop at each stop, the current role pulses red, and the plane rests beyond it. |
| **Thumbnails** | Product screenshots stay in colour (halftoning loses recognition), framed with an ink border and blue offset, with mono captions. |
| **Feature video** | Muted, looping, plays only while on screen; poster frame and controls under reduced motion. |

---

## 8. Motion

- One easing token: `--ease: cubic-bezier(.2,.7,.2,1)`, `--dur: 600ms`.
- **Scroll reveal** (`util/motion.js`): elements fade and rise once; `--i` staggers siblings.
- **Print-in charts:** bars scale from the left when revealed.
- **Split-flap** riffle on the board and the lounge loader.
- All decorative motion sits inside `@media (prefers-reduced-motion: no-preference)`; under
  `reduce` everything renders its final state, the route map draws instantly, video does not
  autoplay, and specimens start paused or show their end state.

---

## 9. Accessibility

Target: WCAG 2.2 AA.

- **Contrast:** body ink 16:1, secondary 10:1, meta 6:1 on paper. Blue is only ever a fill behind
  ink text, never text on paper. Band text uses band locals so it cannot invert.
- **Structure:** semantic landmarks, one `h1` per page, hierarchical headings, a **skip link** to
  `#main`, `lang="en-AU"`.
- **Focus:** a 3px red `:focus-visible` outline everywhere (`--focus`); canvases and specimen
  terminals are focusable and get the same ring.
- **Keyboard:** every specimen is operable without a pointer: word search (arrows + Enter), minimap
  (arrows/Page keys move the viewport), VIC-20 walker (Space run/pause, → step), entropy grid,
  emote demos. The lounge supports WASD/arrows and E to open a monitor.
- **Images:** every illustration has a `<title>`/`aria-labelledby` or is `aria-hidden` when
  decorative; photos and diagrams have full descriptions (diagrams use `<desc>` to explain the flow).
- **Live regions:** specimen status lines (`role="status"`, `aria-live="polite"`) announce results.
- **Motion:** full `prefers-reduced-motion` support (§8); the lounge falls back to a static chapter list.
- **Audio:** the emote-go voice plays only on a click, with a visible "Play the voice" toggle.
- **Touch:** targets ≥ 44px; `touch-action: none` only on canvases that need drag.
- **Mobile:** layouts reflow at 360px with no horizontal page scroll; wide diagrams scroll inside
  their own frame rather than shrinking text.

---

## 10. The Skyport of Tomorrow (3D)

A walkable lounge in Three.js r170 (`lounge.html`, `js/lounge/`). It renders the print system in 3D
rather than going photoreal.

### Look
- `MeshToonMaterial` with a **3-step gradient map** for flat, printed shading.
- **Ink outlines** with `OutlineEffect` on near objects only; distant city, clouds and glass are excluded (`noLine`) to halve draw cost.
- Palette restricted to paper, ink, blue, blue-deep and red; flat fog in paper/pale blue; the CSS grain overlay sits on top of the canvas.
- Procedural geometry only: no model downloads. A googie lounge with a glass dome, boomerang tables, tulip chairs; outside, needle towers, saucer platforms, pulp rockets (lathe body at 5:1, red nose and scythe fins, flickering flame) and saucers with pulsing thrust dots on spline paths.
- **Robot traveller:** an original 1950s robot (glass dome with spinning discs, ribbed collar, chest lights, accordion arms, stacked-sphere legs). An homage to the era, deliberately not a replica of any trademarked character.
- **Monitors:** one per chapter on swan-neck stands, each a `CanvasTexture` "broadcast card" (flight code, numeral, title, opening line, ink vignette).

### Interaction
- **Desktop:** WASD/arrows to walk, click-to-walk by raycast on the floor, E to open the nearest monitor.
- **Touch:** bottom-left joystick, tap-to-walk, "Tap to view" prompt; overlay becomes a bottom sheet with safe-area insets.
- **Movement model:** velocity is damped (`1 − e^(−k·dt)`), heading comes from input not velocity, rotations take the shortest angle, the waddle phase advances with **distance travelled** (not time × speed), and dt is clamped. These fixed jitter when accelerating, reversing and strafing (the follow camera holds yaw during lateral moves to avoid a feedback loop).
- **Camera:** smooth follow; occluding lamps and the lift glass fade or hide when between camera and robot rather than moving the camera.
- **Exit lift:** a short glass tube in the centre. Doors at a fixed opening slide apart when near; stepping in asks "Take the lift back to the almanac?"; confirming closes the doors, sinks the whole car below a clipping plane at floor level, closes an iris hatch, plays the "Now arriving · The Almanac" wipe, then navigates. Driven by animation state with a 4s no-frame fallback.

### Performance and loading
- **On demand only:** the page first shows a light boarding screen and the chapter list; Three.js and the scene load via dynamic `import()` only when "Board the Skyport" is pressed (prefetch on hover). The main site never loads 3D code. (~54 KB before boarding, ~768 KB after.)
- **Adaptive quality:** pixel ratio capped at 2 (1.5 on touch, 1 on Save-Data / ≤4 GB devices) and stepped down by a frame-time governor when frames average over 20 ms.
- **Draw calls:** static geometry merged per material, instancing for repeated items, shared materials, `matrixAutoUpdate = false` on static objects; `#debug` logs calls and triangles.
- **Lifecycle:** the loop pauses when the tab is hidden; WebGL context loss is handled; everything is disposed on exit.
- **Fallback:** no WebGL or reduced motion shows the static chapter list (with an opt-in "Enter anyway").

---

## 11. Voice

Plain, specific, British/Australian spelling. Period flavour appears in labels and headings
("Flight log", "Log of the command", "Now boarding"), never in body copy. Facts come only from
repositories, the CV or supplied sources (`docs/content-sources.md`); nothing is invented.
