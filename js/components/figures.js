/**
 * Facts & Figures — the 1957 bar-chart page, with CV numbers only.
 *
 *   Figures({ figures })  groups FIGURES by their `chart` key. A group with
 *     several members becomes a BarChart on its own axis (different groups are
 *     never plotted together); a single-member group becomes a FigureTile.
 *   BarChart({ title, head, items, log })  reversed black bars, value cells in
 *     paper, labels knocked out in paper when the bar is long enough.
 *     `log` is used (and labelled) when values span more than two orders of magnitude.
 *   FigureTile({ fig })   outlined numeral with blue offset shadow.
 */
import { html } from '../util/html.js';

const CHARTS = {
  count: { title: 'Mould Detect by the numbers', head: '2026 · IN UNITS' },
  percent: { title: 'Margins and savings', head: 'IN PER CENT' },
  people: { title: 'Scale of influence', head: 'PEOPLE AND TEAMS' }
};

function scale(items) {
  const max = Math.max(...items.map((f) => f.value));
  const min = Math.min(...items.map((f) => f.value));
  const log = max / min > 100;
  const top = log ? Math.log10(max) * 1.02 : (max <= 100 ? 100 : max);
  const w = (v) => (log ? Math.max(4, (Math.log10(v) / top) * 100) : (v / top) * 100);
  return { log, w };
}

export function BarChart({ title, head, items }) {
  const { log, w } = scale(items);
  const sorted = [...items].sort((a, b) => b.value - a.value);
  return html`<figure class="chart" aria-label=${title}>
    <div class="roundel chart__roundel">${title}<small>${log ? 'Logarithmic scale' : 'Linear scale'}</small></div>
    <div class="chart__body">
      <div class="chart__head"><span>${head}</span><span>${log ? 'LOG SCALE' : '0–100'}</span></div>
      ${sorted.map((f, i) => {
        const pct = w(f.value);
        return html`<div class=${'bar' + (pct > 46 ? ' bar--in' : '')} style=${`--w:${pct.toFixed(1)}%;--i:${i}`}>
          <span class="bar__val">${f.display}</span>
          <span class="bar__track"><span class="bar__fill"></span><span class="bar__label" title=${f.unit}>${f.label}</span></span>
        </div>`;
      })}
      ${log ? html`<figcaption class="chart__note">Bars on a log scale so small counts stay visible; values printed exactly.</figcaption>` : ''}
    </div>
  </figure>`;
}

export function FigureTile({ fig, i = 0 }) {
  return html`<div class="figtile reveal" style=${'--i:' + i}>
    <span class="figtile__num">${fig.display}</span>
    <span class="figtile__label">${fig.label}</span>
    <p class="figtile__unit">${fig.unit}</p>
  </div>`;
}

/** Count chart for INNOVATION rows: outlined numeral, statement, organisations, bar scaled to the largest count. */
export function InnovationChart({ rows }) {
  const top = Math.max(...rows.map((r) => r.n));
  return html`<figure class="chart chart--innov" aria-label="Digital Technology Innovation">
    <div class="roundel chart__roundel">Digital Technology Innovation<small>Organisations</small></div>
    <div class="chart__body">
      <div class="chart__head"><span>CREATED OR CO-CREATED</span><span>COUNT</span></div>
      ${rows.map((r, i) => html`<div class="innov" style=${`--w:${((r.n / top) * 100).toFixed(1)}%;--i:${i}`}>
        <span class="innov__n">${r.n}</span>
        <div class="innov__body"><p class="innov__label">${r.label}</p><p class="innov__orgs">${r.orgs}</p><span class="innov__bar" aria-hidden="true"></span></div>
      </div>`)}
    </div>
  </figure>`;
}

export function Figures({ figures, innovation }) {
  const groups = new Map();
  figures.forEach((f) => { const k = f.chart || f.id; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(f); });
  const charts = [], tiles = [];
  groups.forEach((items, key) => {
    if (key === 'percent' && innovation) return;   // replaced by the Digital Technology Innovation chart
    if (items.length > 1) charts.push(BarChart({ ...(CHARTS[key] || { title: key, head: key.toUpperCase() }), items }));
    else tiles.push(items[0]);
  });
  return html`<div class="figures">
    <div class="figures__charts">${charts}${innovation ? InnovationChart({ rows: innovation }) : null}</div>
    <div class="figures__tiles">${tiles.map((fig, i) => FigureTile({ fig, i }))}</div>
  </div>`;
}
