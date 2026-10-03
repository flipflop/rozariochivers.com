/** Specimen: sabre — the walk-cycle player from the sabre-wulf-vic20 atlas, animating Roz's 1984 sprite bytes
 *  (transcribed from the graph-paper notes) as character-cell steps on a VIC-20-style screen. */
import { frag } from './_util.js';
import { ANIMS } from './sabre-anims.js';

const FLAME = ['#ffffff', '#ffaa22', '#ff4422', '#ffaa22'];
const FG = '#e8f4f2', BG = '#0a0c10', RULE = '#3d4a52';

export function mount(el, project, { reduced = false } = {}) {
  try {
    const root = frag(`<div class="sp-vic">
      <div class="sp-vic__panel">
        <div class="sp-vic__screen"><canvas width="640" height="200" role="img" aria-label="Walk cycle animated from Roz's transcribed 1984 sprite bytes"></canvas><div class="sp-vic__scan" aria-hidden="true"></div></div>
        <div class="sp-vic__ctl">
          <button type="button" data-play>&#9654; RUN</button>
          <label>SET <select data-set>${ANIMS.map((a, i) => `<option value="${i}">${a.label}</option>`).join('')}</select></label>
          <label>SPEED <input data-fps type="range" min="1" max="12" value="3" step="1"> <span data-out>3 STEPS/S</span></label>
          <span class="sp-vic__note">WHITE ON BLACK &middot; 22 COLUMNS &middot; NO SPRITES, JUST CHARACTERS</span>
        </div>
      </div>
      <p class="sp-note">The walk player from the Vic20 Nostalgia atlas. Every frame is drawn from the sprite bytes Roz worked out by hand on graph paper in 1984: the figure steps one whole 8-pixel character cell at a time, as the original BASIC re-printed it at a shifting <span class="mono">TAB()</span> column, and turns back at the screen edge as its mirror image.</p>
    </div>`);
    el.replaceChildren(root);
    const cv = root.querySelector('canvas'), ctx = cv.getContext('2d');
    const sel = root.querySelector('[data-set]'), btn = root.querySelector('[data-play]'), rng = root.querySelector('[data-fps]'), out = root.querySelector('[data-out]');
    ctx.imageSmoothingEnabled = false;
    let cur = 0, frame = 0, x = 8, dir = 1, playing = !reduced, speed = 3, last = 0, raf = 0, visible = true;

    const scaleOf = (a) => Math.floor(cv.height / a.h * 0.72);
    const matrix = (a) => a.mode === 'patrol' ? (dir > 0 ? a.right : a.left)[frame % (dir > 0 ? a.right : a.left).length] : a.mode === 'rocket' ? a.ship : a.frames[frame];
    const blit = (m, ox, oy, s) => { for (let yy = 0; yy < m.length; yy++) for (let xx = 0; xx < m[yy].length; xx++) if (m[yy][xx]) ctx.fillRect(ox + xx * s, oy + yy * s, s, s); };
    const draw = () => {
      const a = ANIMS[cur], s = scaleOf(a), oy = Math.floor((cv.height - a.h * s) / 2);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, cv.width, cv.height);
      if (a.mode === 'rocket') {
        const ox = Math.floor((cv.width - a.w * s) / 2);
        ctx.fillStyle = FG; blit(a.ship, ox, oy, s);
        ctx.fillStyle = FLAME[frame % FLAME.length]; blit(a.flame, ox, oy + a.shipH * s, s);
      } else {
        ctx.fillStyle = FG; blit(matrix(a), Math.floor(x), oy, s);
        ctx.fillStyle = RULE; ctx.fillRect(0, oy + a.h * s + 2, cv.width, 2);
      }
    };
    const step = () => {
      const a = ANIMS[cur], s = scaleOf(a), w = a.w * s;
      if (a.mode === 'patrol') {
        frame++; x += dir * s * 8;
        if (dir > 0 && x + w >= cv.width - 4) { dir = -1; x = cv.width - 4 - w; frame = 0; }
        else if (dir < 0 && x <= 4) { dir = 1; x = 4; frame = 0; }
      } else if (a.mode === 'rocket') frame++;
      else { frame = (frame + 1) % a.frames.length; x += 10; if (x > cv.width) x = -w; }
      draw();
    };
    const tick = (t) => {
      raf = requestAnimationFrame(tick);
      if (!playing || !visible || t - last < 1000 / speed) return;
      last = t; step();
    };
    const label = () => { btn.innerHTML = playing ? '&#9646;&#9646; PAUSE' : '&#9654; RUN'; };
    sel.addEventListener('change', () => { cur = +sel.value; frame = 0; x = 8; dir = 1; draw(); });
    btn.addEventListener('click', () => { playing = !playing; label(); });
    rng.addEventListener('input', () => { speed = +rng.value; out.textContent = speed + ' STEPS/S'; });
    cv.tabIndex = 0;
    cv.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); playing = !playing; label(); } else if (e.key === 'ArrowRight' && !playing) step(); });
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; }); io.observe(cv);
    label(); draw(); raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  } catch (err) { console.warn('sabre specimen', err); }
}
