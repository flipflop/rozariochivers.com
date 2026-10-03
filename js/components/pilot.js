/**
 * The Pilot — profile, career route map and capability grid.
 *
 *   RouteMap({ career })   schematic SVG route chart: employers as airports,
 *                          straight flight legs, oldest left, present right.
 *                          (Schematic, not geographic: most legs are Sydney.)
 *   Legs({ career, earlier })   flight-log cards for each role
 *   Record({ profile })    pilot's record card
 *   Capabilities({ items })  hairline grid of the CV skills summary
 */
import { html } from '../util/html.js';
import { Art } from './ui.js';
import { reducedMotion } from '../util/motion.js';
import { pilotPlane } from './illustrations.js';

// Airport-style codes. A code is printed only when it adds something: if it is just the name
// abbreviated (TAL, QBE, GBS ...) the name alone is shown. MQG is the ASX ticker, so it stays.
/** 'Jul 2023'–'Oct 2023' → '2023'; otherwise 'YYYY–YYYY' or 'YYYY–NOW'. */
const yrs = (r) => { const a = r.start.replace(/^\w+ /, ''), b = r.end === 'Present' ? 'NOW' : r.end.replace(/^\w+ /, ''); return a === b ? a : `${a}–${b}`; };
const CODES = { 'mould-detect': 'MDT', brikiq: 'BIQ', tal: 'TAL', qbe: 'QBE', macquarie: 'MQG', gbst: 'GBS', icare: 'ICR' };
const REGIONS = { London: 'UK', Sydney: 'AU' };

const isAbbrev = (code, name) => {          // code's letters appear in order within the name
  let i = 0;
  for (const ch of name.toUpperCase()) if (ch === code[i]) i++;
  return i === code.length;
};

/** Port label from data: the name, plus the code only when it differs meaningfully. */
function portLabel(r) {
  if (r.id === 'earlier') {
    const regions = [...new Set(Object.keys(REGIONS).filter((c) => r.city.includes(c)).map((c) => REGIONS[c]))];
    return ['EARLIER'].concat(regions.length ? [regions.join(' & ')] : []).join(' · ');
  }
  const code = CODES[r.id];
  return code && !isAbbrev(code, r.short) ? `${r.short} · ${code}` : r.short;
}
const YS = [300, 168, 262, 132, 236, 118, 214, 120];

function routeSvg(career) {
  const legs = [...career].reverse();
  const n = legs.length;
  const pts = legs.map((r, i) => ({ r, x: 90 + i * (1020 / (n - 1)), y: YS[i % YS.length] }));
  // Straight solid legs between consecutive stops (a polyline, drawn one segment per leg).
  const f = (v) => +v.toFixed(1);
  const paths = pts.slice(1).map((q, i) => `<path class="leg" d="M${f(pts[i].x)} ${f(pts[i].y)}L${f(q.x)} ${f(q.y)}"/>`).join('');
  // The journey has arrived: the plane rests just past Mould Detect, on the heading of the last leg.
  const a = pts[n - 2], b = pts[n - 1], hl = Math.hypot(b.x - a.x, b.y - a.y);
  const ux = (b.x - a.x) / hl, uy = (b.y - a.y) / hl, AHEAD = 60;
  const rest = { x: f(b.x + ux * AHEAD), y: f(b.y + uy * AHEAD + 12) };
  const restDeg = f(Math.atan2(uy, ux) * 180 / Math.PI);
  const trail = `<path class="trail" d="M${b.x} ${b.y}L${rest.x} ${rest.y}"/>`;
  const track = `<path class="track" fill="none" d="M${pts.map((q) => `${f(q.x)} ${f(q.y)}`).join('L')}L${rest.x} ${rest.y}"/>`;
  const plane = `<g class="plane-g" transform="translate(${rest.x} ${rest.y}) rotate(${restDeg})"><g transform="scale(.9)">${pilotPlane()}</g></g>`;
  const ports = pts.map(({ r, x, y }, i) => {
    const below = y > 200;
    const ly = below ? y + 44 : y - 52;
    const now = r.end === 'Present';
    const edge = i === 0 ? ' start' : i === n - 1 ? ' end' : '';   // keep end labels inside the chart
    const tx = i === 0 ? x - 17 : i === n - 1 ? x + 17 : x;
    return `<g class="port${now ? ' port--now' : ''}${edge}">
      ${now ? `<circle class="halo" cx="${x}" cy="${y}" r="8"/>` : ''}<circle class="ring" cx="${x}" cy="${y}" r="17"/><circle class="core" cx="${x}" cy="${y}" r="6"/>${now ? '<title>Current role</title>' : ''}
      <text x="${tx}" y="${ly}">${portLabel(r)}</text>
      <text class="yrs" x="${tx}" y="${ly + 16}">${yrs(r)}</text>
    </g>`;
  }).join('');
  let grat = '';
  for (let x = 0; x <= 1200; x += 100) grat += `<path class="grat" d="M${x} 0V420"/>`;
  for (let y = 20; y <= 420; y += 80) grat += `<path class="grat" d="M0 ${y}H1200"/>`;
  const land = `<path class="land brush" d="M0 250C60 220 120 240 170 210C220 180 210 120 280 110C340 100 330 60 400 50L420 0H0Z" opacity=".55"/>
    <path class="land-ht" d="M760 420C780 360 840 350 900 330C980 300 1040 320 1100 280C1150 250 1180 260 1200 250V420Z"/>
    <path class="land brush" d="M840 420C860 380 920 372 980 352C1050 330 1100 344 1200 310V420Z" opacity=".7"/>`;
  const compass = `<g class="compass" transform="translate(1140 360)">
    <circle r="30" fill="none" stroke="#161616" stroke-width="1.2"/><path d="M0 -40L7 0L0 40L-7 0Z" fill="#161616"/><path d="M-40 0L0 6L40 0L0 -6Z" fill="#7DB6D8" stroke="#161616"/>
    <text y="-46">N</text></g>`;
  return `<svg class="routemap art" data-n="${n}" viewBox="0 0 1200 420" role="img" aria-labelledby="route-t route-d">
    <title id="route-t">Career route chart, 1996 to the present</title>
    <desc id="route-d">Eight airports joined by straight flight legs, oldest at left: ${legs.map((r) => `${r.employer} (${r.start} to ${r.end})`).join('; ')}. The journey ends at Mould Detect, the current role, with the aircraft flying onward along a faint dotted trail.</desc>
    ${grat}${land}${compass}${track}${paths}${trail}${ports}${plane}
  </svg>`;
}

/**
 * One-shot scroll animation. Everything is a pure function of elapsed time `t`, so the
 * "#debug-route=0.5" hook can freeze it. All maths in SVG user units (scales with the SVG).
 */
const ease = (x) => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
function animateRoute(fig) {
  const svg = fig.querySelector('svg.routemap');
  if (!svg || reducedMotion()) return;                       // reduced: static final state already rendered
  const legs = [...svg.querySelectorAll('.leg')], track = svg.querySelector('.track'), trail = svg.querySelector('.trail');
  const planeG = svg.querySelector('.plane-g'), ports = [...svg.querySelectorAll('.port')];
  const now = svg.querySelector('.port--now');
  const pts = track.getAttribute('d').slice(1).split('L').map((p) => p.split(' ').map(Number));
  const segLen = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));   // n-1 legs + onward leg
  const heading = segLen.map((_, i) => Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]) * 180 / Math.PI);
  const total = track.getTotalLength(), PAUSE = .22, TRAVEL = 4.2, TURN = .18;
  const maxL = Math.max(...segLen);
  const raw = segLen.map((l) => .55 + .45 * l / maxL), k = TRAVEL / raw.reduce((x, y) => x + y, 0);
  let clock = 0;
  const sched = segLen.map((l, i) => { const d = raw[i] * k, s = { t0: clock, t1: clock + d, l }; clock += d + PAUSE; return s; });
  const DUR = sched[sched.length - 1].t1;
  const arrive = [0, ...sched.map((s) => s.t1)];            // arrive[i] = time plane reaches stop i (last = rest)
  const cum = [0]; segLen.forEach((l) => cum.push(cum[cum.length - 1] + l));
  const lens = legs.map((p) => p.getTotalLength());
  legs.forEach((p, i) => { p.style.strokeDasharray = lens[i]; });
  const nLegs = legs.length, mdIdx = nLegs;                 // Mould Detect = last stop
  const ringEls = ports.map((g) => g.querySelector('.ring'));
  const lerpAng = (a, b, u) => { let d = ((b - a + 540) % 360) - 180; return a + d * u; };
  svg.classList.add('is-anim');
  let lastLit = -1, pulsing = false;

  function render(t) {
    // legs + plane distance along the track
    let s = 0, hd = heading[0];
    sched.forEach((q, i) => {
      const u = t <= q.t0 ? 0 : t >= q.t1 ? 1 : ease((t - q.t0) / (q.t1 - q.t0));
      if (i < nLegs) legs[i].style.strokeDashoffset = lens[i] * (1 - u);
      else trail.style.opacity = u;
      if (u > 0) s = cum[i] + q.l * u;
      if (t >= q.t0) hd = heading[i];
    });
    // smooth turn at each stop: ease from incoming to outgoing heading in a short window around arrival
    for (let i = 1; i < sched.length; i++) {
      const tt = sched[i - 1].t1, u = (t - (tt - TURN * .4)) / (PAUSE + TURN * .4 + .05);
      if (u > 0 && u < 1) hd = lerpAng(heading[i - 1], heading[i], ease(u)); else if (u >= 1 && t >= sched[i].t0 - .001) hd = heading[i];
    }
    const p = track.getPointAtLength(Math.min(s, total));
    planeG.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${hd.toFixed(1)})`);
    // stop rings: pop as the plane passes; dot fills
    ports.forEach((g, i) => {
      const dt = t - arrive[i], lit = dt >= 0;
      g.classList.toggle('is-lit', lit);
      const u = dt >= 0 && dt < .45 ? dt / .45 : 1;
      ringEls[i].style.transform = `scale(${(1 + .15 * Math.sin(Math.PI * u)).toFixed(3)})`;
    });
    const p2 = t >= arrive[mdIdx] + .15;
    if (p2 !== pulsing) { pulsing = p2; now.classList.toggle('is-pulse', p2); }
  }

  const m = /debug-route=([\d.]+)/.exec(location.hash);
  if (m) { render(Math.min(1, +m[1]) * DUR); return; }
  render(0);
  let started = false;
  const io = new IntersectionObserver((es) => {
    if (!es.some((e) => e.isIntersecting) || started) return;
    started = true; io.disconnect();
    const t0 = performance.now();
    const tick = (now_) => { const t = (now_ - t0) / 1000; render(Math.min(t, DUR)); if (t < DUR) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }, { threshold: .35 });
  io.observe(svg);
}

export function RouteMap({ career }) {
  return html`<figure class="routemap-wrap reveal" ref=${animateRoute}>
    ${Art({ markup: routeSvg(career), className: 'routemap-scroll' })}
    <figcaption class="mono routemap__cap"><span class="visually-hidden">Mould Detect: current role. </span>CAREER JOURNEY MAP · SCHEMATIC, NOT TO SCALE · WITH STOPS IN CINCINNATI, LONDON, BRISBANE & SYDNEY</figcaption>
  </figure>`;
}

export function Legs({ career, earlier }) {
  return html`<ol class="legs">
    ${career.map((r) => html`<li class="leg-card reveal">
      <span class="leg-card__when">${r.start} – ${r.end} · ${r.city}</span>
      <span class="leg-card__who">${r.employer}</span>
      <span class="leg-card__role">${r.title}</span>
      <p class="leg-card__hl">${r.highlight}</p>
      ${r.id === 'earlier' ? html`<p class="leg-card__hl leg-card__earlier">${earlier.join(' · ')}</p>` : null}
    </li>`)}
  </ol>`;
}

export function Record({ profile }) {
  return html`<aside class="record reveal" aria-label="Pilot's record">
    <p class="record__head"><span>PILOT'S RECORD</span><span>SINCE 1996</span></p>
    ${profile.photo ? html`<figure class="record__photo"><img src=${profile.photo.src} alt=${profile.photo.alt} width="720" height="720" loading="lazy" decoding="async"></figure>` : null}
    <dl class="record__rows">
      <div><dt>NAME</dt><dd>${profile.name} (${profile.nickname})</dd></div>
      <div><dt>RATINGS</dt><dd>${profile.roles.join(' · ')}</dd></div>
      <div><dt>BASE</dt><dd>${profile.location}</dd></div>
      <div><dt>ENDORSEMENTS</dt><dd>${profile.tagline}</dd></div>
    </dl>
  </aside>`;
}

export function Capabilities({ items }) {
  return html`<ul class="caps-grid">
    ${items.map((c, i) => html`<li class="cap reveal" style=${'--i:' + (i % 3)}>
      <span class="cap__n">${String(i + 1).padStart(2, '0')}</span>
      <h4 class="cap__name">${c.name}</h4>
      <p class="cap__text">${c.text}</p>
    </li>`)}
  </ul>`;
}
