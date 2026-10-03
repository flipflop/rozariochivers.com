/**
 * Departures board (split-flap) and the capability ticker.
 *
 *   Board({ projects })   -> <section> of flight rows; each row links to its chapter
 *   Flaps({ text, len, cls })  -> a row of single-character flap cells
 *   runFlaps(root, { reduced })  animates every .flaps under root to its data-text
 *   Ticker({ items })     -> duplicated marquee track (CSS-driven, pauses on hover)
 *
 * The flaps are real text: the row link carries an aria-label with the plain
 * sentence, the cells are aria-hidden, so screen readers never hear the shuffle.
 */
import { html } from '../util/html.js';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-';

export function Flaps({ text, len, cls = '' }) {
  const t = text.toUpperCase().padEnd(len, ' ').slice(0, len);
  return html`<span class=${'flaps ' + cls} data-text=${t} aria-hidden="true">
    ${t.split('').map((ch) => html`<span class="flap">${ch === ' ' ? ' ' : ch}</span>`)}
  </span>`;
}

const planeIcon = '<svg viewBox="0 0 48 24" aria-hidden="true"><path d="M2 12C8 9 30 8 38 9C44 10 47 12 38 14C30 15 8 15 2 12Z M14 10L8 2H12L22 10Z M20 13L12 23H17L28 13Z M4 11L1 6H4L8 11Z"/></svg>';

export function Board({ projects }) {
  const dest = (p) => (p.title.length > 20 ? p.slug.replace(/-/g, ' ') : p.title);
  const destLen = Math.min(20, Math.max(...projects.map((p) => dest(p).length)));
  return html`<section class="board reveal" aria-labelledby="departures-title">
    <div class="board__top">
      <h2 class="board__title" id="departures-title"><span .innerHTML=${planeIcon}></span>DEPARTURES</h2>
      <div class="board__meta">
        <div class="board__clock" data-clock>--:--</div>
        SYDNEY TERMINAL · ALL CHAPTERS
      </div>
    </div>
    <div class="board__cols" aria-hidden="true"><span>FLIGHT</span><span>DESTINATION</span><span>GATE</span><span>STATUS</span><span></span></div>
    <ol class="board__rows">
      ${projects.map((p) => html`<li>
        <a class="board__row" href=${'project.html?p=' + p.slug}
           aria-label=${`Flight ${p.flight} to chapter ${p.n}, ${p.title}. Gate ${p.n}. ${p.status}.`}>
          <span class="board__flight">${Flaps({ text: p.flight, len: 5 })}</span>
          <span class="board__dest">${Flaps({ text: dest(p), len: destLen })}</span>
          <span class="board__gate">${Flaps({ text: String(p.n).padStart(2, '0'), len: 2 })}</span>
          <span class="board__status">
            ${p.status === 'BOARDING' ? html`<span class="live-dot" aria-hidden="true"></span>` : null}
            ${Flaps({ text: p.status, len: 8, cls: p.status === 'BOARDING' ? 'flaps--status flaps--boarding' : 'flaps--status' })}
          </span>
          <span class="board__go" aria-hidden="true">→</span>
        </a>
      </li>`)}
    </ol>
    <p class="board__foot">SELECT A FLIGHT TO OPEN ITS CHAPTER · EIGHT CHAPTERS · ONE CURRENT COMMAND</p>
  </section>`;
}

/** Shuffle each flap through random glyphs, settling left-to-right. */
export function runFlaps(root, { reduced = false } = {}) {
  const groups = [...root.querySelectorAll('.flaps')];
  if (reduced) return;
  groups.forEach((g, gi) => {
    const cells = [...g.children];
    const target = g.dataset.text;
    cells.forEach((cell, i) => {
      const final = target[i] === ' ' ? ' ' : target[i];
      if (final === ' ') return;
      let n = 6 + i + (gi % 5) * 2;
      const tick = () => {
        cell.classList.remove('is-flip'); void cell.offsetWidth; cell.classList.add('is-flip');
        if (--n <= 0) { cell.textContent = final; return; }
        cell.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        setTimeout(tick, 70);
      };
      setTimeout(tick, gi * 40 + i * 25);
    });
  });
}

export function Ticker({ items }) {
  const list = (hidden) => html`<ul class="ticker__list" aria-hidden=${hidden ? 'true' : null}>${items.map((t) => html`<li>${t}</li>`)}</ul>`;
  return html`<div class="ticker" role="region" aria-label="Capabilities">
    <div class="ticker__track">${list(false)}${list(true)}</div>
  </div>`;
}
