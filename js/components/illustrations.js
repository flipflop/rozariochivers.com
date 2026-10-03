/**
 * Illustrations — original inline-SVG ink drawings in the 1958 almanac style.
 *
 * WHY strings: the html engine builds DOM via createElement and cannot author SVG,
 * so every drawing is a trusted static string injected through an `.innerHTML` seam
 * (see Art() in components/ui.js). Nothing user-supplied ever enters these strings.
 *
 * Vocabulary (classes styled in css/components.css under `.art`):
 *   k  ink fill        p  paper fill      b  sky-blue fill    bd blue over-print
 *   l  ink line 2px    l1 hairline        l3 heavy line       lp paper line
 *   hb blue halftone   hk ink halftone    rough  hand-wobble filter on lines
 *   brush  ragged-edge filter for flat blue shapes
 * Blue shapes are drawn mis-registered (offset 4-6px) against the ink, as in print.
 *
 * Exports:
 *   ArtDefs                 shared <defs> (filters + halftone patterns), mount once per page
 *   coverArt()              gentleman standing before a landed rocket, skyline, saucers
 *   vignette(key)           small chapter drawing for a specimen key
 *   mouldArt()  pilotPlane()  skyportArt()  saucer(x,y,s)
 *   heroArt(key)            blog hero drawings (orchestra)
 */

/* ---------- helpers ---------- */

/** Public-domain / CC0 figures prepared by assets/illustrations/prepare.py (ink #161616, paper shows through). */
const FIG = 'assets/illustrations/';
function fig(file, x, y, w, h, flip = false) {
  const t = flip ? ` transform="translate(${x * 2 + w} 0) scale(-1 1)"` : '';
  return `<image class="fig" href="${FIG}${file}.svg" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMax meet"${t}/>`;
}

/** Seeded PRNG so procedural details are identical on every render. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Cumulus puff with a flat base: irregular arcs, never regular scallops. */
function cloud(x, y, w, h, seed = 1, cls = 'p l') {
  const r = rng(seed);
  let d = `M${x} ${y}`;
  let cx = x;
  const end = x + w;
  while (cx < end - 4) {
    const step = Math.min(end - cx, h * (0.5 + r() * 0.7));
    const ry = h * (0.45 + r() * 0.55);
    d += ` A${(step / 2).toFixed(1)} ${ry.toFixed(1)} 0 0 1 ${(cx + step).toFixed(1)} ${y}`;
    cx += step;
  }
  return `<path class="${cls}" d="${d} Z"/>`;
}

/** Window grid of small rects. */
function windows(x, y, cols, rows, w, h, gx, gy, cls = 'k') {
  let s = '';
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++)
    s += `<rect class="${cls}" x="${x + i * (w + gx)}" y="${y + j * (h + gy)}" width="${w}" height="${h}"/>`;
  return s;
}

/** Lattice tower (gantry / pylon) with X bracing. */
function lattice(x, y, w, h, step) {
  let s = `<path class="l" d="M${x} ${y}V${y + h}M${x + w} ${y}V${y + h}"/>`;
  for (let yy = y; yy < y + h; yy += step) {
    s += `<path class="l1" d="M${x} ${yy}L${x + w} ${yy + step}M${x + w} ${yy}L${x} ${yy + step}M${x} ${yy}H${x + w}"/>`;
  }
  return s;
}

/** Flying saucer centred on x,y at scale s. Rim lights in paper on ink. */
export function saucer(x = 0, y = 0, s = 1, cls = '') {
  return `<g class="saucer ${cls}" transform="translate(${x} ${y}) scale(${s})">
    <path class="b" d="M-30 6 L30 6 L48 44 L-48 44Z" opacity=".55" transform="translate(5 -2)"/>
    <path class="p l" d="M-20 -3C-19 -26 19 -26 20 -3Z"/>
    <path class="hb" d="M4 -22C14 -19 19 -12 20 -3H6Z"/>
    <ellipse class="k" cx="0" cy="0" rx="48" ry="10"/>
    <ellipse class="p" cx="0" cy="-2" rx="40" ry="3"/>
    <g class="p">${[-36, -24, -12, 0, 12, 24, 36].map((cx) => `<circle cx="${cx}" cy="4" r="1.8"/>`).join('')}</g>
    <path class="k" d="M-12 8L-8 16H8L12 8Z"/>
  </g>`;
}

/** Shared defs: filters and halftone screens. Mount once per document. */
export const ArtDefs = `<svg class="art-defs" width="0" height="0" aria-hidden="true" focusable="false">
  <defs>
    <filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7"/>
      <feDisplacementMap in="SourceGraphic" scale="2.6"/>
    </filter>
    <filter id="brush" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="3" seed="3"/>
      <feDisplacementMap in="SourceGraphic" scale="7"/>
    </filter>
    <pattern id="ht-blue" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
      <circle cx="3" cy="3" r="1.55" fill="#4F8DB3"/>
    </pattern>
    <pattern id="ht-ink" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <circle cx="2.5" cy="2.5" r="1.05" fill="#161616"/>
    </pattern>
    <pattern id="ht-ink-lg" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <circle cx="3.5" cy="3.5" r="2" fill="#161616"/>
    </pattern>
    <pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
      <line x1="0" y1="0" x2="0" y2="5" stroke="#161616" stroke-width="1.3"/>
    </pattern>
  </defs>
</svg>`;

/* ---------- cover ---------- */

export function coverArt() {
  const r = rng(11);
  let skyline = '';
  // distant halftone city band
  const blocks = [[0, 610, 44], [40, 575, 30], [96, 600, 40], [210, 585, 36], [282, 560, 30], [318, 600, 46], [548, 590, 40], [590, 540, 50]];
  blocks.forEach(([x, y, w]) => { skyline += `<rect class="hb" x="${x}" y="${y}" width="${w}" height="${714 - y}"/>`; });
  // slab tower with window grid, ink outline mis-registered against blue
  skyline += `<rect class="b" x="246" y="512" width="44" height="202"/>
    <rect class="l1" x="242" y="516" width="44" height="198" fill="none"/>
    ${windows(248, 524, 4, 14, 5, 6, 5, 7, 'k')}`;
  // dome
  skyline += `<path class="b" d="M300 714C300 650 400 650 400 714Z" transform="translate(-6 -4)"/>
    <path class="l" d="M300 714C300 650 400 650 400 714M318 714C322 668 378 668 382 714M350 660V714M300 700H400"/>`;
  // googie boomerang roof
  skyline += `<path class="k" d="M2 640L60 628L96 646L58 640Z"/><path class="l" d="M20 640V714M80 644V714"/>
    <rect class="b" x="14" y="660" width="76" height="54" transform="translate(5 -3)"/>
    <path class="l1" d="M14 660H90M14 676H90"/>`;

  // needle tower
  const needle = `<g class="needle">
    <path class="l3" d="M84 714L110 548M136 714L114 548M96 640H124"/>
    <path class="l1" d="M90 676L130 676M88 690L132 690"/>
    <ellipse class="b" cx="116" cy="540" rx="46" ry="12" transform="translate(-5 4)"/>
    <path class="k" d="M66 536C80 526 152 526 166 536L156 546C140 552 92 552 76 546Z"/>
    <path class="p l" d="M86 530C90 512 142 512 146 530Z"/>
    ${windows(90, 538, 9, 1, 4, 3, 4, 0, 'p')}
    <path class="l" d="M116 512V452"/><circle class="k" cx="116" cy="452" r="3"/>
  </g>`;

  // rocket
  const rocket = `<g class="rocket">
    <path class="b" d="M412 300H488V540H412Z" transform="translate(-7 -5)"/>
    <path class="p l3 rough" d="M450 70C474 120 486 190 488 270L488 540L412 540L412 270C414 190 426 120 450 70Z"/>
    <path class="hb" d="M452 72C474 122 485 190 486 270V538H466V280C465 196 460 124 452 72Z"/>
    <path class="k" d="M450 70C462 94 470 116 474 140L426 140C430 116 438 94 450 70Z"/>
    <rect class="k" x="412" y="300" width="76" height="18"/>
    <path class="l1" d="M413 360H487M413 430H487M413 218H486"/>
    <circle class="p l3" cx="450" cy="186" r="14"/><circle class="b" cx="452" cy="184" r="8"/>
    <circle class="p l" cx="450" cy="244" r="9"/>
    <text class="rocket-type" x="0" y="0" transform="translate(436 470) rotate(-90)">RC · 2026</text>
    <rect class="k" x="452" y="474" width="28" height="48" rx="3"/>
    <path class="p" d="M456 480H476V492H456Z" opacity=".25"/>
    <path class="k rough" d="M412 440C384 468 368 520 364 610L384 610L412 560Z"/>
    <path class="k rough" d="M488 440C516 468 532 520 536 610L516 610L488 560Z"/>
    <rect class="k" x="444" y="520" width="12" height="92"/>
    <path class="p l" d="M422 540H478L488 574H412Z"/><path class="hk" d="M423 542H477L485 572H415Z" opacity=".55"/>
    <path class="l" d="M370 606L352 712M530 606L548 712M340 713H364M536 713H560"/>
  </g>`;

  // airstair from hatch to ground
  let stairs = `<path class="l3" d="M456 524L376 712M472 540L396 714"/>`;
  for (let t = 0.1; t < 0.95; t += 0.075) {
    const ax = 456 - 80 * t, ay = 524 + 188 * t;
    const bx = 472 - 76 * t, by = 540 + 174 * t;
    stairs += `<path class="l" d="M${ax.toFixed(1)} ${ay.toFixed(1)}L${bx.toFixed(1)} ${by.toFixed(1)}"/>`;
  }
  stairs += `<path class="l1" d="M420 608V714M440 572V714"/><circle class="k" cx="384" cy="712" r="5"/><circle class="k" cx="430" cy="712" r="5"/>`;

  // exhaust clouds at the base
  let smoke = '';
  smoke += `<path class="hb" d="M440 714C450 650 600 640 626 700V714Z"/>`;
  smoke += cloud(452, 712, 110, 72, 4, 'p l rough');
  smoke += cloud(520, 714, 106, 54, 9, 'p l rough');
  smoke += cloud(560, 714, 66, 34, 2, 'p l rough');
  smoke += `<path class="b brush" d="M486 714H636V690H500Z" transform="translate(6 -4)" opacity=".7"/>`;

  // black sky wedge with a paper jet, like the Manpower plate
  const sky = `<path class="k brush" d="M14 36C130 28 268 34 372 24L352 64C286 140 196 206 30 252Z"/>
    <path class="lp" d="M300 104C260 112 230 116 200 120M300 112C270 118 244 122 220 124" opacity=".7"/>
    <g class="jet" transform="translate(10 0)">
      <path class="p" d="M258 104L172 118L160 123L176 126L260 114Z"/>
      <path class="p" d="M222 114L198 146L210 146L238 116Z"/>
      <path class="p" d="M224 110L208 92L218 92L240 110Z"/>
      <path class="p" d="M252 108L264 90L271 90L263 112Z"/>
    </g>`;

  // the big blue slab behind the rocket, and a gantry
  const ground = `<path class="b brush" d="M300 120L612 96L626 690L292 704Z"/>
    <path class="bd brush" d="M560 96L612 96L626 690L586 692Z" opacity=".45"/>`;
  const gantry = `<g>${lattice(552, 170, 40, 544, 34)}
    <path class="l3" d="M552 300H488M552 302L520 320"/><path class="l" d="M540 170L604 170"/>
    <circle class="k" cx="572" cy="164" r="5"/></g>`;

  // stars / sparkle marks in the blue
  let stars = '';
  for (let i = 0; i < 9; i++) {
    const x = 320 + r() * 220, y = 130 + r() * 300, s = 3 + r() * 4;
    stars += `<path class="p" d="M${x} ${y - s}L${x + s * .3} ${y}L${x} ${y + s}L${x - s * .3} ${y}Z M${x - s} ${y}L${x} ${y + s * .3}L${x + s} ${y}L${x} ${y - s * .3}Z"/>`;
  }

  // Well-dressed gentleman (PD, 1923), standing in front of the rocket: torn blue under-print offset 8px
  const gentleman = `<g class="traveller">
    <path class="b brush" d="M388 330L444 322L452 346L440 372L486 390L502 436L496 456L458 470L456 560L464 712L386 712L384 480L378 420L402 384L384 350Z" transform="translate(9 6)"/>
    <path class="hb" d="M392 560L384 712L440 712L446 560Z" transform="translate(9 6)"/>
    <image href="${FIG}figure_well-dressed-gentleman-1923-silhouette.png" x="352" y="313" width="126" height="400" aria-hidden="true"/>
    ${fig('figure_well-dressed-gentleman-1923', 352, 313, 126, 400)}
  </g>`;
  return `<svg class="art art--cover" viewBox="0 0 640 760" role="img" aria-labelledby="cover-art-t">
    <title id="cover-art-t">Ink illustration: a well-dressed gentleman in a suit and boater stands in front of a landed rocket, hands in his pockets, with a needle tower, a domed skyline and a gantry behind him while saucers drift overhead.</title>
    ${ground}${sky}${stars}${skyline}${needle}${gantry}${rocket}${stairs}${smoke}
    <path class="b brush" d="M96 702C150 690 270 690 330 706L320 716L104 716Z" transform="translate(6 -4)"/>
    <path class="k brush" d="M0 712C140 708 420 716 640 710V720H0Z"/>
    ${gentleman}
    <g class="drift drift--a">${saucer(130, 262, 0.9)}</g>
    <g class="drift drift--b">${saucer(560, 60, 0.55)}</g>
  </svg>`;
}

/* ---------- chapter vignettes (viewBox 0 0 400 260) ---------- */

const V = {
  /* 1 Entropy Grid: 1950s pill microphone listening to a grid with a potted plant */
  entropy() {
    const r = rng(21);
    let grid = '';
    for (let j = 0; j < 5; j++) for (let i = 0; i < 7; i++) {
      const v = r();
      const cls = v > 0.72 ? 'k' : v > 0.5 ? 'b' : 'p';
      grid += `<rect class="${cls} l1" x="${30 + i * 26}" y="${118 + j * 22}" width="26" height="22"/>`;
    }
    return `<rect class="b brush" x="210" y="20" width="170" height="200" transform="translate(6 -4)"/>
      <g transform="skewX(-14) translate(40 0)">${grid}</g>
      <path class="k" d="M118 116L128 92H152L162 116Z"/>
      <path class="k brush" d="M140 94C120 70 104 74 92 56C112 58 130 68 140 90M140 92C146 62 162 52 178 46C172 66 160 82 142 94M140 92C140 70 134 50 140 30C148 52 146 72 142 92"/>
      <path class="l" d="M300 236V170M268 240H332"/><ellipse class="k" cx="300" cy="240" rx="34" ry="6"/>
      <path class="l3" d="M260 120C258 160 342 160 340 120"/>
      <ellipse class="p l3 rough" cx="300" cy="106" rx="36" ry="60"/>
      <path class="hb" d="M300 46C324 54 336 80 336 106C336 134 324 158 300 166Z"/>
      ${[-24, -16, -8, 0, 8, 16, 24].map((dx) => `<path class="l1" d="M${300 + dx} ${50 + Math.abs(dx) * 0.5}V${162 - Math.abs(dx) * 0.5}"/>`).join('')}
      <rect class="k" x="290" y="160" width="20" height="14"/>
      <path class="l rough" d="M232 70C222 86 222 126 232 142M218 60C204 84 204 132 218 152M204 50C186 82 186 136 204 162"/>`;
  },

  /* 2 Word Search PS: the 1995 puzzle sheet itself, full 5x5 grid, found words looped in ink */
  wordsearch() {
    const rows = ['MODEM', 'XNETB', 'HOSTI', 'LOGIN', 'FTPLT'];
    let txt = '';
    rows.forEach((row, j) => row.split('').forEach((ch, i) => {
      txt += `<text class="svg-letter" style="font-size:27px" x="${148 + i * 26}" y="${70 + j * 38}">${ch}</text>`;
    }));
    return `<rect class="b brush" x="112" y="14" width="176" height="232" transform="translate(-9 6)"/>
      <path class="p l rough" d="M124 22H282L278 240H128Z"/>
      ${txt}
      <ellipse class="l3 rough" cx="200" cy="61" rx="70" ry="17" fill="none" transform="rotate(-2 200 61)"/>
      <ellipse class="l3 rough" cx="187" cy="137" rx="58" ry="16" fill="none" transform="rotate(1 187 137)"/>
      <ellipse class="l3 rough" cx="200" cy="175" rx="70" ry="17" fill="none" transform="rotate(-1 200 175)"/>
      <ellipse class="l3 rough" cx="200" cy="99" rx="44" ry="15" fill="none" transform="rotate(2 200 99)"/>
      <path class="hb" d="M282 40L300 46L296 236L278 240Z"/>
      <path class="k rough" d="M302 214L346 120L356 125L312 219Z"/>
      <path class="k" d="M302 214L298 230L312 219Z"/>
      <path class="l" d="M346 120L351 110L360 115L356 125"/>`;
  },

  /* 3 minimap-js: radar scope console beside a chart with a viewport frame */
  minimap() {
    return `<rect class="b brush" x="210" y="40" width="170" height="160" transform="translate(6 -4)"/>
      <path class="p l rough" d="M214 54L376 40L384 196L222 210Z"/>
      ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path class="l1" d="M${232} ${74 + i * 18}L${300 + (i % 3) * 20} ${70 + i * 18}"/>`).join('')}
      <rect class="l3" x="238" y="96" width="70" height="58" fill="none" transform="rotate(-4 273 125)"/>
      <path class="k rough" d="M40 236L54 110H194L208 236Z"/>
      <circle class="k" cx="124" cy="120" r="70"/>
      <circle class="p" cx="124" cy="120" r="60"/>
      <path class="b" d="M124 120L124 60A60 60 0 0 1 176 90Z"/>
      <path class="hb" d="M124 120L176 90A60 60 0 0 1 184 120Z"/>
      <circle class="l1" cx="124" cy="120" r="20" fill="none"/><circle class="l1" cx="124" cy="120" r="40" fill="none"/>
      <path class="l1" d="M64 120H184M124 60V180"/>
      <circle class="k" cx="150" cy="96" r="3"/><circle class="k" cx="104" cy="140" r="3"/>
      <circle class="p" cx="80" cy="214" r="7"/><circle class="p" cx="168" cy="214" r="7"/>
      <rect class="p" x="104" y="208" width="40" height="10"/>`;
  },

  /* 4 Bullet Graph: instrument panel of dials and bar gauges */
  bullet() {
    const dial = (cx, cy, a) => `<circle class="p l" cx="${cx}" cy="${cy}" r="30"/>
      ${Array.from({ length: 9 }, (_, i) => { const t = (-210 + i * 30) * Math.PI / 180; return `<path class="l1" d="M${(cx + Math.cos(t) * 24).toFixed(1)} ${(cy + Math.sin(t) * 24).toFixed(1)}L${(cx + Math.cos(t) * 29).toFixed(1)} ${(cy + Math.sin(t) * 29).toFixed(1)}"/>`; }).join('')}
      <path class="l3" d="M${cx} ${cy}L${(cx + Math.cos(a) * 22).toFixed(1)} ${(cy + Math.sin(a) * 22).toFixed(1)}"/><circle class="k" cx="${cx}" cy="${cy}" r="4"/>`;
    const bar = (y, v, t) => `<rect class="b" x="170" y="${y}" width="180" height="18"/><rect class="hb" x="170" y="${y}" width="120" height="18"/>
      <rect class="bd" x="170" y="${y}" width="70" height="18"/><rect class="k" x="170" y="${y + 6}" width="${v}" height="6"/>
      <rect class="p" x="${170 + t}" y="${y + 2}" width="3" height="14"/>`;
    return `<path class="k rough" d="M20 30H380L372 236H28Z"/>
      <rect class="b brush" x="14" y="200" width="372" height="40" transform="translate(6 6)"/>
      <rect class="k" x="20" y="226" width="360" height="12"/>
      ${dial(80, 80, -0.9)}${dial(80, 168, -2.4)}
      ${bar(54, 150, 162)}${bar(96, 96, 130)}${bar(138, 130, 112)}${bar(180, 60, 150)}
      <path class="lp" d="M150 44V206"/>`;
  },

  /* 5 Vic20 Nostalgia: a 1984 kid at the desk (vintage typing man, CC0) over the graph-paper grid */
  sabre() {
    const r = rng(5);
    let px = '';
    for (let i = 0; i < 16; i++) px += `<rect class="${r() > .5 ? 'b' : 'bd'}" x="${Math.round(r() * 24) * 16}" y="${Math.round(r() * 14) * 16}" width="16" height="16" opacity=".85"/>`;
    let grid = '';
    for (let x = 96; x <= 304; x += 16) grid += `<path class="l1" d="M${x} 16V244" opacity=".35"/>`;
    for (let y = 16; y <= 244; y += 16) grid += `<path class="l1" d="M96 ${y}H304" opacity=".35"/>`;
    return `${grid}${px}
      <path class="b brush" d="M82 34L322 22L330 238L90 248Z" transform="translate(8 6)"/>
      <path class="hb" d="M232 150L330 146L334 244L238 250Z"/>
      ${fig('figure_vintage-typing-man', 74, 22, 260, 207)}
      <g transform="rotate(-4 340 232)"><rect class="p l1" x="296" y="218" width="76" height="26"/><text class="svg-letter" x="334" y="236" style="font-size:16px;letter-spacing:.2em">1984</text></g>`;
  },

  /* 6 emote-go: a 1950s television (CC0 line art) scaled up so the cabinet fills the frame (antenna tips and legs
     crop at the vignette edge like a print crop); a laughing 1950s woman (CC0, halftoned) fills the screen */
  'emote-go'() {
    const sx = 1.12, tx = 54.4, ty = -189;           /* tv-1950s.svg is 260x576; cabinet spans y 205-391, screen x 26.5-203.5, y 225-364.5 */
    return `<clipPath id="eg-vig"><rect width="400" height="260"/></clipPath>
      <clipPath id="eg-screen"><rect x="85.6" y="64.5" width="195.2" height="153" rx="30"/></clipPath>
      <g clip-path="url(#eg-vig)">
        <path class="b brush" d="M54 42L344 36L348 248L58 254Z" transform="translate(10 7)"/>
        <image class="fig" href="${FIG}tv-1950s.svg" x="${tx}" y="${ty}" width="${(260 * sx).toFixed(1)}" height="${(576 * sx).toFixed(1)}"/>
        <g clip-path="url(#eg-screen)">
          <image href="${FIG}tv-woman-1950s.svg?v=9" x="84.1" y="63" width="198.2" height="156" preserveAspectRatio="xMidYMid slice"/>
          <path class="l1" d="M84 100H283M84 134H283M84 168H283M84 202H283" opacity=".14"/>
        </g>
      </g>`;
  },

  /* 7 emote-chat: a candlestick-telephone talker and a wall-phone caller, facing each other (PD/CC0 figures) */
  'emote-chat'() {
    return `<path class="b brush" d="M30 112L96 92L176 120L176 252L40 252Z" transform="translate(8 6)"/>
      <path class="b brush" d="M250 100L360 96L372 252L256 252Z" transform="translate(8 6)"/>
      <path class="hb" d="M120 190L176 190L176 252L120 252Z"/>
      ${fig('figure_man-on-candlestick-telephone', 26, 88, 154, 170, true)}
      ${fig('figure_classic-phone-couple', 246, 84, 132, 170)}
      <g transform="translate(0 -10) scale(1 .78)">
        <path class="b brush" d="M40 20H190L200 96H120L96 118L100 96H48Z" transform="translate(5 -4)"/>
        <path class="p l rough" d="M40 20H190L196 92H120L96 114L100 92H44Z"/>
        <path class="l1" d="M60 44H170M60 58H150M60 72H164"/>
        <path class="k rough" d="M210 30H360L356 98H306L322 120L290 98H214Z"/>
        <path class="lp" d="M230 50H340M230 64H320M230 78H300"/>
      </g>`;
  },

  /* 8 emote-cli: a portable typewriter (PD) with a paper tape running off the platen */
  'emote-cli'() {
    const r = rng(8);
    let holes = '';
    for (let i = 0; i < 12; i++) for (let j = 0; j < 3; j++) if (r() > .45) holes += `<circle class="k" cx="${26 + i * 9}" cy="${(52 + j * 8 + i * 3.1).toFixed(1)}" r="2.2"/>`;
    return `<path class="b brush" d="M138 40L330 28L372 236L150 252Z" transform="translate(8 6)"/>
      <path class="hb" d="M138 196L372 196L372 252L150 252Z"/>
      <path class="p l rough" d="M14 40C48 32 96 52 148 92L136 132C92 98 48 80 14 90Z"/>
      ${holes}
      <path class="l" d="M10 128C26 112 40 132 56 118M12 146C28 130 42 150 58 136" />
      ${fig('typewriter_remington-portable', 126, 18, 250, 232)}`;
  }
};

export function vignette(key) {
  const draw = V[key];
  if (!draw) return '';
  return `<svg class="art art--vignette" viewBox="0 0 400 260" aria-hidden="true" focusable="false">${draw()}</svg>`;
}

/* ---------- feature drawings ---------- */

/** Mould Detect: a phone scanning a wall corner with halftone mould blooms. */
export function mouldArt() {
  const r = rng(42);
  let spots = '';
  for (let i = 0; i < 26; i++) {
    const x = 60 + r() * 150, y = 40 + r() * 120, s = 4 + r() * 16;
    spots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${s.toFixed(1)}"/>`;
  }
  return `<svg class="art art--mould" viewBox="0 0 420 320" role="img" aria-labelledby="mould-art-t">
    <title id="mould-art-t">Ink illustration: a smartphone held up to a wall corner, scanning dark mould blooms.</title>
    <path class="band-paper rough" d="M20 20H260L250 300H30Z"/>
    <path class="band-line" d="M30 230H252M30 246H252"/>
    <g fill="url(#ht-ink-lg)">${spots}</g>
    <g class="k">${spots.replace(/r="([\d.]+)"/g, (_, v) => `r="${(v * 0.35).toFixed(1)}"`)}</g>
    <path class="b" d="M262 120L150 70L150 200Z" opacity=".55"/>
    <circle class="band-ring" cx="128" cy="104" r="64"/>
    <path class="band-ring" d="M128 30V46M128 162V178M54 104H70M186 104H202"/>
    <g transform="rotate(-12 320 170)">
      <rect class="b" x="264" y="66" width="110" height="200" rx="16" transform="translate(7 -5)"/>
      <rect class="band-phone" x="264" y="66" width="110" height="200" rx="16"/>
      <rect class="band-paper" x="274" y="86" width="90" height="156" rx="4"/>
      <circle class="band-line" cx="319" cy="140" r="26" fill="none"/>
      <path class="band-line" d="M319 106V120M319 160V174M285 140H299M339 140H353"/>
      <rect class="hb" x="284" y="196" width="70" height="8"/><rect class="b" x="284" y="212" width="48" height="8"/><rect class="b" x="284" y="228" width="60" height="8"/>
    </g>
  </svg>`;
}

/** Small propeller airliner, side-on, nose right. For the route map marker. */
export function pilotPlane() {
  return `<g class="plane">
    <path class="k" d="M-34 -2C-20 -8 20 -8 30 -4C36 -2 38 2 30 4C20 6 -20 6 -34 2Z"/>
    <path class="k" d="M-28 -2L-40 -18L-34 -18L-20 -4Z"/>
    <path class="k" d="M-4 2L-14 18H-6L10 2Z"/>
    <path class="p" d="M-18 -4H22" stroke-dasharray="3 3" style="stroke:var(--paper);stroke-width:2"/>
    <path class="l" d="M38 -10V12"/>
  </g>`;
}

/** Skyport of Tomorrow: needle tower carrying a saucer lounge above a cloud sea. */
export function skyportArt() {
  return `<svg class="art art--skyport" viewBox="0 0 480 360" aria-hidden="true" focusable="false">
    <path class="b brush" d="M120 30L440 20L452 330L110 340Z"/>
    <circle class="p l" cx="380" cy="80" r="34"/><circle class="hb" cx="388" cy="84" r="30"/>
    <path class="l3" d="M240 340L262 150M290 340L268 150M250 270H282M246 300H286"/>
    ${lattice(254, 160, 20, 170, 24)}
    <ellipse class="b" cx="266" cy="150" rx="104" ry="20" transform="translate(-7 6)"/>
    <path class="k" d="M156 140C190 126 342 126 376 140L360 160C330 172 202 172 172 160Z"/>
    <path class="p l rough" d="M196 134C204 92 328 92 336 134Z"/>
    <path class="hb" d="M290 102C314 108 330 118 336 134H292Z"/>
    ${windows(178, 146, 14, 1, 7, 4, 5, 0, 'p')}
    <path class="l" d="M266 98V52"/><circle class="k" cx="266" cy="50" r="4"/>
    ${cloud(0, 330, 200, 44, 3, 'p l rough')}${cloud(300, 334, 180, 36, 6, 'p l rough')}${cloud(150, 352, 190, 30, 12, 'p l rough')}
    <g class="drift drift--a">${saucer(90, 90, 0.7)}</g>
    <g class="drift drift--b">${saucer(420, 220, 0.45)}</g>
  </svg>`;
}

/* ---------- blog hero drawings ---------- */

const HERO = {
  /* Agent Orchestra: a conductor's podium and baton before a fan of robot-headed terminals */
  orchestra() {
    const rows = [[240, 104, 0.9, 5], [240, 150, 1, 7]];
    let fan = '';
    rows.forEach(([cx, y, sc, n], ri) => {
      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0 : i / (n - 1) - 0.5;
        const x = cx + t * (ri ? 400 : 290);
        const yy = y + Math.abs(t) * 34;
        const rot = t * 26;
        fan += `<g transform="translate(${x.toFixed(1)} ${yy.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${sc})">
          <rect class="b" x="-20" y="-24" width="46" height="40" rx="6" transform="translate(5 -4)"/>
          <rect class="p l" x="-22" y="-22" width="44" height="38" rx="6"/>
          <rect class="k" x="-15" y="-15" width="30" height="16" rx="2"/>
          <circle class="p" cx="-7" cy="-7" r="3"/><circle class="p" cx="7" cy="-7" r="3"/>
          <path class="l1" d="M-12 8H12M-8 12H8"/>
          <path class="l" d="M0 -22V-31"/><circle class="k" cx="0" cy="-33" r="2.4"/>
          <path class="k" d="M-12 16H12L16 30H-16Z"/>
        </g>`;
      }
    });
    return `<svg class="art art--orchestra" viewBox="0 0 480 340" role="img" aria-labelledby="orch-art-t">
    <title id="orch-art-t">Ink illustration: a conductor's podium with a baton, before a fan of small robot-headed terminals arranged like an orchestra.</title>
    <path class="b brush" d="M24 30L452 18L462 318L16 326Z"/>
    <circle class="hb" cx="400" cy="70" r="42"/>
    <g class="hk" opacity=".5"><path d="M40 300L120 214L200 300Z"/></g>
    ${fan}
    <path class="l" d="M60 238C150 214 330 214 420 238" />
    <ellipse class="k" cx="240" cy="304" rx="104" ry="14"/>
    <path class="p l3" d="M150 300V252H330V300Z"/>
    <path class="hb" d="M290 254H328V298H290Z"/>
    <rect class="k" x="150" y="244" width="180" height="10"/>
    <path class="l1" d="M170 266H270M170 278H250"/>
    <path class="k" d="M226 252L234 206H246L254 252Z"/>
    <circle class="p l" cx="240" cy="192" r="12"/>
    <path class="l3" d="M246 208L286 162"/><circle class="k" cx="290" cy="158" r="3.5"/>
    <path class="l1" d="M296 144C306 136 314 140 320 132M300 170C312 168 320 176 330 170"/>
  </svg>`;
  }
};

/** Hero illustration for a blog post, by its `hero` key. */
export function heroArt(key) {
  const draw = HERO[key];
  return draw ? draw() : '';
}
