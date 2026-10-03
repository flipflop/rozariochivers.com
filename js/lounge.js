/**
 * Skyport of Tomorrow — bootstrap, chrome (loading, HUD, PA, panel) and fallback.
 * The 3D engine lives in js/lounge/*.js and is imported only when WebGL is usable.
 */
import { PROJECTS } from './data/projects.js';
import { html, h } from './util/html.js';
import { Flaps, runFlaps } from './components/board.js';

const $ = (s) => document.querySelector(s);
const reducedMQ = matchMedia('(prefers-reduced-motion: reduce)').matches;
const force3d = new URLSearchParams(location.search).has('3d');

function hasGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

/* ---------------- landing: static boarding screen + chapter list (no three.js yet) ---------------- */
function showLanding(canGL, why) {
  document.body.classList.add('is-list');
  $('#loading').classList.add('is-done');
  const list = $('#fallback'); list.hidden = false; list.replaceChildren();
  const btn = canGL ? h('button', { class: 'btn board-btn', type: 'button' }, 'Board the Skyport ', h('span', { 'aria-hidden': 'true' }, '→')) : null;
  const flaps = html`<div class="landing__flaps">${Flaps({ text: 'NOW', len: 3 })}${Flaps({ text: 'BOARDING', len: 8 })}</div>`;
  list.append(...[
    html`<section class="landing"><p class="kicker">The Skyport of Tomorrow · Gate 0</p>${flaps}
      <p class="landing__why">${canGL ? 'Walk a 3D 1950s skyport lounge and step up to eight monitors, one per chapter. The 3D scene downloads only when you board.' : why}</p>
      <div class="landing__act">${btn}<a class="btn btn--ghost" href="index.html">Back to the almanac</a></div></section>`,
    html`<h1>Eight chapters, eight gates</h1>`,
    html`<ol>${PROJECTS.map((p) => html`<li>
      <span class="num" aria-hidden="true">${String(p.n).padStart(2, '0')}</span>
      <span class="flight">FLIGHT ${p.flight} · ${p.status}</span>
      <h2>${p.title}</h2>
      <p>${p.standfirst}</p>
      <a class="btn" href=${'project.html?p=' + p.slug}>Read chapter <span aria-hidden="true">→</span></a>
    </li>`)}</ol>`,
  ].flat());
  runFlaps(list, { reduced: reducedMQ });
  if (btn) {
    const warm = () => { for (const u of ['js/lounge/engine.js', 'vendor/three/three.module.min.js']) { if (!document.querySelector(`link[href="${u}"]`)) document.head.append(h('link', { rel: 'prefetch', href: u, as: 'script' })); } };
    btn.addEventListener('pointerenter', warm, { once: true }); btn.addEventListener('focus', warm, { once: true });
    btn.addEventListener('click', () => start(reducedMQ));
  }
}

/* ---------------- 3D mode ---------------- */
async function start(reduced) {
  /* overlay goes fully opaque synchronously (no fade-in); canvas stays hidden until the first frame is ready */
  const loadEl = $('#loading'); loadEl.style.transition = 'none'; loadEl.classList.remove('is-done'); $('#stage').style.visibility = 'hidden';
  document.body.classList.remove('is-list'); $('#fallback').hidden = true;
  document.body.classList.add('is-3d', 'is-flying');
  addEventListener('contextmenu', (e) => { if (e.target.tagName === 'CANVAS') e.preventDefault(); });
  const flapsHost = $('#loadingFlaps');
  flapsHost.append(Flaps({ text: 'NOW', len: 3 }), Flaps({ text: 'BOARDING', len: 8 }));
  runFlaps($('#loading'), { reduced: false });
  const t0 = performance.now();

  const hud = $('#hud'); hud.hidden = false;
  let paused = false, nearP = null, nearLift = false, eng = null;
  const joy = { x: 0, y: 0 };
  const prompt = h('button', { class: 'btn hud__prompt', type: 'button', hidden: false });
  const paText = h('div', { class: 'hud__pa-text', 'aria-live': 'off' });
  const knob = h('i'); const joyEl = h('div', { class: 'hud__joy', 'aria-hidden': 'true' }, knob);
  const help = h('button', { class: 'hud__help', type: 'button', 'aria-expanded': 'false' }, 'Controls ',
    h('span', {}, 'WASD / arrows to walk. Click the floor to walk there. Stand near a monitor and press E, or tap it, to open its chapter. Esc closes.'));
  help.onclick = () => help.setAttribute('aria-expanded', help.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
  hud.append(
    h('a', { class: 'hud__back', href: 'index.html' }, '← Back to the almanac'),
    h('div', { class: 'hud__title' }, 'Skyport of Tomorrow · ', h('b', {}, '8 gates')),
    help, prompt, joyEl,
    h('div', { class: 'hud__pa' }, h('span', { class: 'hud__pa-tag' }, 'PA'), paText));

  /* PA ticker */
  const lines = [
    ...PROJECTS.map((p) => `Now boarding: flight ${p.flight}, ${p.title}. Proceed to gate ${p.n}.`),
    'Welcome to the Skyport of Tomorrow. Please mind the clouds.',
    'Passengers are reminded that all chapters are included in the fare.',
  ];
  let li = 0;
  const say = () => { paText.classList.add('is-out'); setTimeout(() => { paText.textContent = lines[li++ % lines.length]; paText.classList.remove('is-out'); }, 400); };
  paText.textContent = 'Welcome to the Skyport of Tomorrow. Walk to a monitor and press E.';
  setInterval(() => { if (!paused) say(); }, 15000);
  /* joystick */
  let jid = null;
  const jmove = (e) => { const r = joyEl.getBoundingClientRect(), R = r.width / 2; let dx = e.clientX - (r.left + R), dy = e.clientY - (r.top + R); const d = Math.hypot(dx, dy); if (d > R) { dx *= R / d; dy *= R / d; } knob.style.transform = `translate(${dx}px,${dy}px)`; joy.x = Math.abs(dx / R) < 0.15 ? 0 : dx / R; joy.y = Math.abs(dy / R) < 0.15 ? 0 : -dy / R; };
  joyEl.addEventListener('pointerdown', (e) => { jid = e.pointerId; joyEl.setPointerCapture(jid); jmove(e); });
  joyEl.addEventListener('pointermove', (e) => { if (e.pointerId === jid) jmove(e); });
  const jend = (e) => { if (e.pointerId === jid) { jid = null; joy.x = joy.y = 0; knob.style.transform = ''; } };
  joyEl.addEventListener('pointerup', jend); joyEl.addEventListener('pointercancel', jend);

  /* overlay panel */
  const panel = h('div', { class: 'lpanel', hidden: true, role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Chapter details' });
  document.body.append(panel);
  let lastFocus = null;
  const close = () => { panel.hidden = true; paused = false; lastFocus && lastFocus.focus && lastFocus.focus(); };
  const open = (p) => {
    if (paused) return; paused = true; lastFocus = document.activeElement;
    panel.replaceChildren(html`<div class="chamfer">
      <p class="chamfer__title">Chapter ${String(p.n).padStart(2, '0')} · Flight ${p.flight} · ${p.status}</p>
      <h2>${p.title}</h2>
      <p>${p.standfirst}</p>
      <ul class="tags">${p.tags.map((t) => html`<li>${t}</li>`)}</ul>
      <div class="lpanel__act">
        <a class="btn" href=${'project.html?p=' + p.slug}>Read chapter <span aria-hidden="true">→</span></a>
        ${p.live === p.source
          ? html`<a class="btn btn--ghost" href=${p.source} target="_blank" rel="noopener">Source <span aria-hidden="true">↗</span></a>`
          : html`<a class="btn btn--ghost" href=${p.live} target="_blank" rel="noopener"><span class="live-dot" aria-hidden="true"></span> Live</a>`}
        <button class="btn btn--ghost" type="button" data-close>Close</button>
      </div></div>`);
    panel.hidden = false; panel.querySelector('.btn').focus();
  };
  panel.addEventListener('click', (e) => { if (e.target === panel || e.target.closest('[data-close]')) close(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) close(); });
  prompt.addEventListener('click', () => { if (nearP) open(nearP); else if (nearLift && eng) eng.walkToLift(); });

  await document.fonts.ready;
  await Promise.all(['700 20px Oswald', '500 20px Oswald', '400 40px Marcellus'].map((f) => document.fonts.load(f).catch(() => {})));
  try {
    const { startEngine } = await import('./lounge/engine.js');
    eng = startEngine({
      onReady: () => {
        $('#stage').style.visibility = '';
        const wait = location.hash.includes('fast') ? 0 : Math.max(0, 1500 - (performance.now() - t0));
        setTimeout(() => { loadEl.style.transition = reducedMQ || !wait ? 'none' : ''; loadEl.classList.add('is-done'); }, wait);
      },
      stage: $('#stage'), projects: PROJECTS, reduced, joy, isPaused: () => paused, onOpen: open,
      onNear: (p, lift) => {
        nearP = p; nearLift = !!lift && !p; prompt.classList.toggle('is-on', !!p || nearLift);
        const touch = matchMedia('(pointer: coarse)').matches;
        if (p) prompt.replaceChildren(h('span', {}, touch ? 'Tap to view' : 'Press E / Tap'), ' ', h('small', {}, `Ch. ${String(p.n).padStart(2, '0')} ${p.title}`));
        else if (nearLift) prompt.replaceChildren(h('span', {}, 'Walk in to return to the almanac'));
      },
      onExit: (kind) => {
        let went = false;
        const go = () => { if (went) return; went = true; const wipe = h('div', { class: 'wipe' }, h('p', {}, 'Now arriving'), h('b', {}, 'The Almanac')); document.body.append(wipe); requestAnimationFrame(() => wipe.classList.add('is-on'));
          setTimeout(() => { document.body.classList.remove('is-flying'); try { eng.dispose(); } catch (e) { /* navigate regardless */ } if (!/holdnav/.test(location.hash)) location.href = 'index.html#skyport'; }, reducedMQ ? 0 : 1100); };
        if (!kind) return go();
        paused = true;
        const take = () => { dlg.remove(); paused = false; eng.descend(); const w = setInterval(() => { if (!/hold/.test(location.hash) && performance.now() - eng.lastFrame() > 4000) { clearInterval(w); go(); } }, 1000); };
        const dlg = h('div', { class: 'lpanel', role: 'dialog', 'aria-modal': 'true' }, h('div', { class: 'chamfer' }, h('p', { class: 'chamfer__title' }, 'Return lift'), h('h2', {}, 'Take the lift back to the almanac?'),
          h('div', { class: 'lpanel__act' }, h('button', { class: 'btn', type: 'button', onclick: take }, 'Take the lift'), h('button', { class: 'btn btn--ghost', type: 'button', onclick: () => { dlg.remove(); paused = false; eng.unlock(); } }, 'Stay'))));
        document.body.append(dlg); dlg.querySelector('.btn').focus();
        if (/take/.test(location.hash)) setTimeout(take, 400);
      },
    });
  } catch (err) { console.warn('3D skyport failed:', err); hud.hidden = true; document.body.classList.remove('is-3d', 'is-flying'); return showLanding(false, 'The 3D skyport could not start on this device, so here are the chapters.'); }
}

const gl = hasGL();
if (!gl) showLanding(false, 'This browser cannot draw the 3D skyport, so here are the eight chapters as a plain departures list.');
else if (force3d || location.hash.includes('fast')) start(reducedMQ && !force3d);
else showLanding(true);
