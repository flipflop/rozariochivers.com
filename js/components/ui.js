/**
 * Shared almanac primitives — pure props -> DOM node functions.
 *
 *   Art({ markup, className })               trusted inline-SVG seam (innerHTML)
 *   RunningHead({ folio, side })             "98   TECHNOLOGY FACTS AND FIGURES, 2026"
 *   SectionHead({ id, kicker, title, lede })
 *   Plate({ n, title, size, tag })           outlined numeral in a black block + blue band
 *   Facts({ title, rows })                   chamfered blue panel of label/value rows
 *   Tags({ items })                          mono outlined tags
 *   Go({ label, href, external })            caps link with sliding arrow
 */
import { html } from '../util/html.js';

export const BOOK = 'Technology Facts and Figures, 2026';

/** The one seam where trusted SVG strings (illustrations.js) enter the DOM. */
export function Art({ markup, className = 'art-wrap' }) {
  return html`<div class=${className} .innerHTML=${markup}></div>`;
}

export function RunningHead({ folio, side = 'left', title = BOOK }) {
  return html`<div class=${'running-head' + (side === 'right' ? ' running-head--right' : '')} aria-hidden="true">
    <span class="running-head__folio">${folio}</span><span>${title}</span>
  </div>`;
}

export function SectionHead({ id, kicker, title, lede }) {
  return html`<header class="section-head reveal">
    <p class="section-head__kicker">${kicker}</p>
    <h2 class="section-head__title" id=${id}>${title}</h2>
    ${lede ? html`<p class="section-head__lede">${lede}</p>` : null}
  </header>`;
}

export function Plate({ n, title, size = '', tag = 'h3', id = null }) {
  const num = String(n);
  const heading = tag === 'h1'
    ? html`<h1 class="plate__title" id=${id}>${title}</h1>`
    : tag === 'h2' ? html`<h2 class="plate__title" id=${id}>${title}</h2>`
      : html`<h3 class="plate__title" id=${id}>${title}</h3>`;
  return html`<div class=${'plate' + (size ? ' plate--' + size : '')}>
    <span class="plate__num" aria-label=${'Chapter ' + num}>${num}</span>
    <div class="plate__band">${heading}</div>
  </div>`;
}

export function Facts({ title, rows }) {
  return html`<aside class="chamfer" aria-label=${title}>
    <p class="chamfer__title">${title}</p>
    <dl class="facts">${rows.map(([k, v]) => html`<div><dt>${k}</dt><dd>${v}</dd></div>`)}</dl>
  </aside>`;
}

export function Tags({ items }) {
  return html`<ul class="tags" aria-label="Technologies">${items.map((t) => html`<li>${t}</li>`)}</ul>`;
}

export function Go({ label, href, external = false }) {
  return html`<a class="go" href=${href} target=${external ? '_blank' : null} rel=${external ? 'noopener' : null}>
    ${label}<span class="go__arrow" aria-hidden="true">→</span></a>`;
}
