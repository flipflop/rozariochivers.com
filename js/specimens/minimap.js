/** Specimen: minimap — Roz's feature-flags.js (2018) beside its minimap, linked by a draggable viewport.
 *  Canvas mode shows the real PNG made by the Code-Mini-Maps tool; Unicode blocks mode draws the same file live. */
import { tok, frag, fitCanvas, esc } from './_util.js';

const SRC = 'assets/code/feature-flags.js.txt';
const PNG = 'assets/images/minimap-feature-flags.png';
const KW = /\b(let|const|var|return|if|else|for|of|in|new|typeof|function|try|catch|throw|export|import)\b/;

/** Classify each character of a line for colouring: comment, string, keyword, punctuation, text. */
function classify(line, inBlock) {
  const out = new Array(line.length).fill('t');
  let i = 0, block = inBlock;
  while (i < line.length) {
    if (block) { const e = line.indexOf('*/', i); const end = e < 0 ? line.length : e + 2; out.fill('c', i, end); i = end; if (e >= 0) block = false; continue; }
    const two = line.slice(i, i + 2);
    if (two === '//') { out.fill('c', i); break; }
    if (two === '/*') { block = true; continue; }
    const ch = line[i];
    if (ch === '"' || ch === "'" || ch === '`') { let j = i + 1; while (j < line.length && line[j] !== ch) j += line[j] === '\\' ? 2 : 1; out.fill('s', i, j + 1); i = j + 1; continue; }
    const m = /^[A-Za-z_$][\w$]*/.exec(line.slice(i));
    if (m) { if (KW.test(m[0]) && m[0].length === KW.exec(m[0])[0].length) out.fill('k', i, i + m[0].length); i += m[0].length; continue; }
    if (/[()[\]{}<>=;,.:+\-*/!&|?]/.test(ch)) out[i] = 'p';
    i++;
  }
  return { cls: out, block };
}

export function mount(el, project, { reduced = false } = {}) {
  try {
    const T = tok();
    const root = frag(`<div class="sp-mm">
      <div class="sp-mm__bar">
        <div class="sp-mm__modes" role="group" aria-label="Render mode">
          <button class="btn btn--ghost" type="button" data-mode="png" aria-pressed="true">Canvas</button>
          <button class="btn btn--ghost" type="button" data-mode="blocks" aria-pressed="false">Unicode blocks</button>
        </div>
        <span class="mono sp-mm__read" data-read aria-live="off">feature-flags.js · loading…</span>
      </div>
      <div class="sp-mm__stage sp-mm__stage--split">
        <pre class="sp-mm__code" tabindex="0" aria-label="feature-flags.js source"></pre>
        <div class="sp-mm__map"><canvas tabindex="0" role="slider" aria-label="Minimap viewport for feature-flags.js" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></canvas></div>
      </div>
      <p class="sp-note">Roz’s <span class="mono">feature-flags.js</span> (August 2018) beside its minimap. Canvas mode shows the real image rendered by the Code-Mini-Maps tool; Unicode blocks mode draws the same file live, one block per character. Read it as type: comment blocks set in grey, indentation as margin, blank lines as leading. Drag the red frame, or scroll the code, to move through the file.</p>
    </div>`);
    el.replaceChildren(root);
    const pre = root.querySelector('pre'), cv = root.querySelector('canvas'), read = root.querySelector('[data-read]'), map = root.querySelector('.sp-mm__map');
    const dead = new AbortController(), sig = { signal: dead.signal };
    let mode = 'png', lines = [], classes = [], img = null, ctx, W = 0, H = 0, raf = 0, drag = false;

    const colour = { c: T.ink3, s: T.red, k: T.blueDeep, p: T.ink2, t: T.ink };
    const GLYPH = { t: '█', k: '█', s: '▓', p: '▒', c: '░' };

    const render = () => {
      if (!ctx) return;
      ctx.fillStyle = T.paper2; ctx.fillRect(0, 0, W, H);
      if (mode === 'png' && img) {
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = '#272822'; ctx.fillRect(0, 0, W, H);
        ctx.drawImage(img, 0, 0, W, H);
      } else if (lines.length) {
        const lh = H / lines.length, maxLen = Math.max(...lines.map((l) => l.replace(/\t/g, '    ').length), 40), cw = W / maxLen;
        ctx.font = `${Math.max(4, Math.min(lh * 1.05, cw * 1.7)).toFixed(1)}px ${T.mono}`; ctx.textBaseline = 'top';
        lines.forEach((l, y) => {
          const cl = classes[y];
          for (let x = 0; x < l.length; x++) {
            if (l[x] === ' ' || l[x] === '\t') continue;
            ctx.fillStyle = colour[cl[x]]; ctx.fillText(GLYPH[cl[x]], x * cw, y * lh);
          }
        });
      }
      // viewport frame = lines visible in the code pane
      const span = Math.max(1, pre.scrollHeight), top = pre.scrollTop / span, vis = pre.clientHeight / span;
      const vy = top * H, vh = Math.max(8, vis * H);
      ctx.fillStyle = T.paper; ctx.globalAlpha = mode === 'png' ? .35 : .55;
      ctx.fillRect(0, 0, W, vy); ctx.fillRect(0, vy + vh, W, H - vy - vh); ctx.globalAlpha = 1;
      ctx.strokeStyle = T.red; ctx.lineWidth = 2; ctx.strokeRect(1, vy + 1, W - 2, vh - 2);
      const first = Math.round(top * lines.length) + 1, last = Math.min(lines.length, Math.round((top + vis) * lines.length));
      read.textContent = `feature-flags.js · lines ${first}–${last} of ${lines.length}`;
      cv.setAttribute('aria-valuenow', String(Math.round(top / Math.max(.0001, 1 - vis) * 100)));
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; render(); }); };

    const resize = () => {
      H = Math.max(320, Math.min(pre.clientHeight || 520, 560));
      W = Math.round(H * (img ? img.width / img.height : 0.42));
      map.style.width = W + 'px'; ({ ctx } = fitCanvas(cv, W, H)); render();
    };

    const scrollTo = (cy) => {
      const frac = Math.max(0, Math.min(1, cy / H));
      pre.scrollTop = frac * pre.scrollHeight - pre.clientHeight / 2; queue();
    };
    cv.addEventListener('pointerdown', (e) => { drag = true; cv.setPointerCapture(e.pointerId); scrollTo(e.clientY - cv.getBoundingClientRect().top); }, sig);
    cv.addEventListener('pointermove', (e) => { if (drag) scrollTo(e.clientY - cv.getBoundingClientRect().top); }, sig);
    cv.addEventListener('pointerup', () => { drag = false; }, sig);
    cv.addEventListener('keydown', (e) => {
      const step = { ArrowUp: -40, ArrowDown: 40, PageUp: -pre.clientHeight, PageDown: pre.clientHeight, Home: -1e6, End: 1e6 }[e.key];
      if (step == null) return; e.preventDefault(); pre.scrollTop += step; queue();
    }, sig);
    pre.addEventListener('scroll', queue, { passive: true, ...sig });
    root.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
      mode = b.dataset.mode; root.querySelectorAll('[data-mode]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); render();
    }, sig));
    const ro = new ResizeObserver(resize); ro.observe(root);

    const pic = new Image(); pic.decoding = 'async'; pic.src = PNG;
    Promise.all([fetch(SRC).then((r) => r.text()), pic.decode().then(() => pic).catch(() => null)]).then(([text, im]) => {
      if (dead.signal.aborted) return;
      img = im; lines = text.replace(/\r/g, '').replace(/\n$/, '').split('\n');
      let block = false;
      classes = lines.map((l) => { const r = classify(l, block); block = r.block; return r.cls; });
      pre.innerHTML = lines.map((l, i) => {
        const cl = classes[i]; let html = '', run = '', k = cl[0];
        const flush = () => { if (run) html += `<span class="tk-${k}">${esc(run)}</span>`; run = ''; };
        for (let x = 0; x < l.length; x++) { if (cl[x] !== k) { flush(); k = cl[x]; } run += l[x]; }
        flush();
        return `<span class="ln"><span class="ln__n" aria-hidden="true">${i + 1}</span>${html || ' '}</span>`;
      }).join('');
      resize();
    }).catch((err) => { read.textContent = 'feature-flags.js · could not load'; console.warn('minimap specimen', err); });

    return () => { dead.abort(); ro.disconnect(); cancelAnimationFrame(raf); };
  } catch (err) { console.warn('minimap specimen', err); }
}
