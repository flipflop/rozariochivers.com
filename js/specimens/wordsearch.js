/** Specimen: wordsearch — a playable word search using the original game's eight networking terms. */
import { tok, frag, fitCanvas } from './_util.js';

const WORDS = ['MODEM', 'NET', 'HOST', 'LOGIN', 'FTP', 'LAN', 'NODE', 'BIT'];
const N = 8;
const DIRS = [[1, 0], [0, 1], [1, 1], [-1, 0], [0, -1], [1, -1]];

function build() {
  for (let attempt = 0; attempt < 200; attempt++) {
    const g = Array.from({ length: N }, () => Array(N).fill(''));
    const placed = [];
    let ok = true;
    for (const w of [...WORDS].sort((a, b) => b.length - a.length)) {
      let done = false;
      for (let t = 0; t < 120 && !done; t++) {
        const [dx, dy] = DIRS[(Math.random() * DIRS.length) | 0];
        const x = (Math.random() * N) | 0, y = (Math.random() * N) | 0;
        const ex = x + dx * (w.length - 1), ey = y + dy * (w.length - 1);
        if (ex < 0 || ex >= N || ey < 0 || ey >= N) continue;
        let fits = true;
        for (let i = 0; i < w.length; i++) { const c = g[y + dy * i][x + dx * i]; if (c && c !== w[i]) { fits = false; break; } }
        if (!fits) continue;
        for (let i = 0; i < w.length; i++) g[y + dy * i][x + dx * i] = w[i];
        placed.push({ w, x, y, ex, ey }); done = true;
      }
      if (!done) { ok = false; break; }
    }
    if (ok) {
      const A = 'ABCDEFGHIKLMNOPRSTUY';
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!g[y][x]) g[y][x] = A[(Math.random() * A.length) | 0];
      return { g, placed };
    }
  }
  return null;
}

export function mount(el, project, { reduced = false } = {}) {
  try {
    const T = tok();
    const root = frag(`<div class="sp-ws">
      <div class="sp-ws__main">
        <canvas tabindex="0" role="application" aria-label="Word search, 8 by 8. Drag across letters to select a word. From the keyboard: arrow keys move, Enter marks the start and then the end of a word."></canvas>
        <ul class="sp-ws__list" aria-label="Words to find"></ul>
      </div>
      <p class="sp-ws__msg mono" role="status" aria-live="polite">How to play: hold down the mouse button and draw a line across a word to select it (on a touch screen, drag your finger across it). Words run in any direction. You can also click the first letter, then the last.</p>
      <div class="sp-ws__bar"><button class="btn btn--ghost" type="button" data-new>New grid</button></div>
      <p class="sp-note">Illustration: a fresh 8×8 grid using the original game's eight words. The real 1995 game is a 5×5 grid, written in PostScript and run by the project's own interpreter.</p>
    </div>`);
    el.replaceChildren(root);
    const cv = root.querySelector('canvas'), list = root.querySelector('.sp-ws__list'), msg = root.querySelector('.sp-ws__msg');
    const dead = new AbortController(), sig = { signal: dead.signal };
    let puz, found, size = 0, ctx, a = null, b = null, cur = { x: 0, y: 0 }, anchor = null, dragging = false, cs = 0;

    const reset = () => {
      puz = build(); found = new Set();
      list.replaceChildren(...WORDS.map((w) => { const li = document.createElement('li'); li.dataset.w = w; li.textContent = w; return li; }));
      msg.textContent = 'How to play: hold down the mouse button and draw a line across a word to select it (on a touch screen, drag your finger across it). Words run in any direction. You can also click the first letter, then the last.';
      a = b = anchor = null; draw();
    };
    const snap = (s, e) => {   // constrain end to a straight 8-way line from start
      const dx = e.x - s.x, dy = e.y - s.y; if (!dx && !dy) return { ...s };
      const ang = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)), d = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]][(ang + 8) % 8];
      const len = Math.max(Math.abs(dx), Math.abs(dy)); let n = len;
      while (n > 0 && (s.x + d[0] * n < 0 || s.x + d[0] * n >= N || s.y + d[1] * n < 0 || s.y + d[1] * n >= N)) n--;
      return { x: s.x + d[0] * n, y: s.y + d[1] * n };
    };
    const line = (s, e) => { const n = Math.max(Math.abs(e.x - s.x), Math.abs(e.y - s.y)), dx = Math.sign(e.x - s.x), dy = Math.sign(e.y - s.y); return Array.from({ length: n + 1 }, (_, i) => ({ x: s.x + dx * i, y: s.y + dy * i })); };
    const capsule = (s, e, fill, stroke) => {
      const x1 = (s.x + .5) * cs, y1 = (s.y + .5) * cs, x2 = (e.x + .5) * cs, y2 = (e.y + .5) * cs;
      ctx.lineCap = 'round'; ctx.lineWidth = cs * .78; ctx.strokeStyle = fill; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      if (stroke) { ctx.lineWidth = 2; ctx.strokeStyle = stroke; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
    };
    function draw() {
      if (!ctx || !puz) return;
      ctx.fillStyle = T.paper; ctx.fillRect(0, 0, size, size);
      ctx.save(); ctx.globalAlpha = .55;
      for (const p of puz.placed) if (found.has(p.w)) capsule({ x: p.x, y: p.y }, { x: p.ex, y: p.ey }, T.blue);
      ctx.restore();
      if (a && b) { ctx.save(); ctx.globalAlpha = .5; capsule(a, b, T.blue, T.ink); ctx.restore(); }
      ctx.font = `500 ${Math.round(cs * .5)}px ${T.cond}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = T.ink;
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) ctx.fillText(puz.g[y][x], (x + .5) * cs, (y + .55) * cs);
      // original-style red cross-out for found words
      for (const p of puz.placed) if (found.has(p.w)) { ctx.strokeStyle = T.red; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo((p.x + .5) * cs, (p.y + .5) * cs); ctx.lineTo((p.ex + .5) * cs, (p.ey + .5) * cs); ctx.stroke(); }
      ctx.strokeStyle = T.ink; ctx.lineWidth = 2; ctx.strokeRect(1, 1, size - 2, size - 2);
      if (document.activeElement === cv) { ctx.strokeStyle = T.ink; ctx.lineWidth = 2; ctx.strokeRect(cur.x * cs + 2, cur.y * cs + 2, cs - 4, cs - 4); }
    }
    const resize = () => { size = Math.min(380, Math.max(220, root.clientWidth - 2)); cs = size / N; ({ ctx } = fitCanvas(cv, size, size)); draw(); };
    const cell = (e) => { const r = cv.getBoundingClientRect(); return { x: Math.max(0, Math.min(N - 1, Math.floor((e.clientX - r.left) / r.width * N))), y: Math.max(0, Math.min(N - 1, Math.floor((e.clientY - r.top) / r.height * N))) }; };
    const commit = () => {
      if (!a || !b) return;
      const word = line(a, b).map((c) => puz.g[c.y][c.x]).join(''), rev = [...word].reverse().join('');
      const hit = WORDS.find((w) => !found.has(w) && (w === word || w === rev));
      if (hit) {
        found.add(hit); list.querySelector(`[data-w="${hit}"]`).classList.add('is-found');
        msg.textContent = found.size === WORDS.length ? 'All eight found. Press New grid to play again.' : `Found ${hit}. ${WORDS.length - found.size} to go.`;
      } else if (word.length > 1) msg.textContent = `${word} is not one of the words.`;
      a = b = anchor = null; draw();
    };
    // Pointer: drag from the first letter to the last, OR click the first letter then click the last.
    cv.addEventListener('pointerdown', (e) => {
      const c = cell(e); cur = c;
      if (anchor) { a = anchor; b = snap(anchor, c); anchor = null; commit(); return; }
      dragging = true; cv.setPointerCapture(e.pointerId); a = c; b = c; draw();
    }, sig);
    cv.addEventListener('pointermove', (e) => {
      if (dragging) { b = snap(a, cell(e)); draw(); }
      else if (anchor) { a = anchor; b = snap(anchor, cell(e)); draw(); }
    }, sig);
    cv.addEventListener('pointerup', () => {
      if (!dragging) return; dragging = false;
      if (a && b && a.x === b.x && a.y === b.y) { anchor = { ...a }; msg.textContent = `Start marked on ${puz.g[a.y][a.x]}. Now click the last letter of the word.`; draw(); return; }
      commit();
    }, sig);
    cv.addEventListener('pointercancel', () => { dragging = false; a = b = null; draw(); }, sig);
    cv.addEventListener('keydown', (e) => {
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (d) { e.preventDefault(); cur = { x: Math.max(0, Math.min(N - 1, cur.x + d[0])), y: Math.max(0, Math.min(N - 1, cur.y + d[1])) }; if (anchor) { b = snap(anchor, cur); a = anchor; } draw(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!anchor) { anchor = { ...cur }; a = anchor; b = anchor; msg.textContent = 'Start marked. Move to the last letter and press Enter.'; draw(); } else { b = snap(anchor, cur); a = anchor; anchor = null; commit(); } }
      else if (e.key === 'Escape') { anchor = null; a = b = null; draw(); }
    }, sig);
    cv.addEventListener('focus', draw, sig); cv.addEventListener('blur', draw, sig);
    root.querySelector('[data-new]').addEventListener('click', reset, sig);
    const ro = new ResizeObserver(resize); ro.observe(root);
    reset(); resize();
    return () => { dead.abort(); ro.disconnect(); };
  } catch (err) { console.warn('wordsearch specimen', err); }
}
