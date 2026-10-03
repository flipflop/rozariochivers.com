/** Specimen: bullet — pure-CSS bullet graphs (bar, marker, bands) driven by figures from the data files. */
import { frag, esc } from './_util.js';
import { FIGURES } from '../data/profile.js';

const byId = (id) => FIGURES.find((f) => f.id === id);

export function mount(el, project, { reduced = false } = {}) {
  try {
    const rows = [
      { label: 'Gross margin, Mould Detect', unit: '%', max: 100, bar: byId('margin-low'), mark: byId('margin-high'), note: 'Bar: low case. Marker: high case.' },
      { label: 'Digital cost reduction, QBE', unit: '%', max: 50, bar: byId('cost-qbe'), mark: byId('tco-gbst'), note: 'Bar: QBE. Marker: GBST (approximate).' },
      { label: 'Engineers served, Macquarie MAX', unit: '', max: 1000, bar: { value: 300, display: '300' }, mark: byId('engineers'), note: 'Bar: lower bound. Marker: upper bound, as stated in the CV (300–1,000).' }
    ].filter((r) => r.bar);
    const pct = (v, m) => Math.max(0, Math.min(100, (v / m) * 100));
    const root = frag(`<div class="sp-bullet" data-size="m">
      <div class="sp-bullet__bar">
        <div role="group" aria-label="Graph size" class="sp-bullet__sizes">
          ${['s', 'm', 'l', 'xl'].map((k) => `<button class="btn btn--ghost" type="button" data-s="${k}" aria-pressed="${k === 'm'}">${k.toUpperCase()}</button>`).join('')}
        </div>
        <button class="btn btn--ghost" type="button" data-replay>Replay</button>
      </div>
      <div class="sp-bullet__rows">${rows.map((r, i) => `
        <figure class="sp-bullet__row" style="--bar:${pct(r.bar.value, r.max).toFixed(1)}%;--mark:${r.mark ? pct(r.mark.value, r.max).toFixed(1) : 0}%">
          <figcaption><span class="caps">${esc(r.label)}</span><span class="mono">${esc(r.bar.display)}${r.mark && r.mark.display !== r.bar.display ? ' · target ' + esc(r.mark.display) : ''}</span></figcaption>
          <div class="sp-bullet__g" role="img" aria-label="${esc(r.label)}: ${esc(r.bar.display)}${r.mark ? ', marker at ' + esc(r.mark.display) : ''}">
            <i class="b1"></i><i class="b2"></i><i class="b3"></i>
            <i class="bar"></i>${r.mark ? '<i class="mk"></i>' : ''}
          </div>
          <div class="sp-bullet__ax mono"><span>0</span><span>${r.max.toLocaleString()}${r.unit}</span></div>
          <small>${esc(r.note)}</small>
        </figure>`).join('')}
      </div>
      <p class="sp-note">Illustration. Bars and markers use only figures from this site's data (the CV figures). The shaded bands behind them are qualitative (poor, satisfactory, good, as in Stephen Few's design) and carry no data. The real project is pure CSS with no JavaScript; here a little script only replays the animation.</p>
    </div>`);
    el.replaceChildren(root);
    const dead = new AbortController(), sig = { signal: dead.signal };
    const rowsEl = [...root.querySelectorAll('.sp-bullet__row')];
    const play = () => {
      rowsEl.forEach((r) => r.classList.remove('is-on'));
      if (reduced) { rowsEl.forEach((r) => r.classList.add('is-on')); return; }
      void root.offsetWidth; rowsEl.forEach((r, i) => setTimeout(() => r.classList.add('is-on'), 120 + i * 140));
    };
    root.querySelector('[data-replay]').addEventListener('click', play, sig);
    root.querySelectorAll('[data-s]').forEach((b) => b.addEventListener('click', () => {
      root.dataset.size = b.dataset.s; root.querySelectorAll('[data-s]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    }, sig));
    let io = null;
    if ('IntersectionObserver' in window && !reduced) { io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { play(); io.disconnect(); } }); io.observe(root); } else play();
    return () => { dead.abort(); io && io.disconnect(); };
  } catch (err) { console.warn('bullet specimen', err); }
}
