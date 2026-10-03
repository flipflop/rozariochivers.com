/**
 * Index page sections — pure render functions over the data modules.
 *
 *   ChapterPanel({ project, span })   one chapter: vignette, plate, standfirst, tags
 *   Chapters({ projects })            asymmetric 12-column grid of panels
 *   Command({ md })                   Mould Detect "current command" — the one ink band
 *   Talks({ talks })                  The Lecture Circuit: two featured halftone cards + a timetable
 *   SkyportPass()                     boarding-pass invitation into lounge.html
 *   Letters({ links })                contact rows
 */
import { html } from '../util/html.js';
import { Art, Plate, Tags, Facts } from './ui.js';
import { vignette, mouldArt, skyportArt } from './illustrations.js';
import { mouldFlow } from './diagrams.js?v=20261003j';

const SPANS = [7, 5, 5, 7, 6, 6, 7, 5];

export function ChapterPanel({ project: p, span = 6, i = 0 }) {
  return html`<article class="panel reveal" style=${`--span:${span};--i:${i % 2}`} aria-labelledby=${'ch-' + p.slug}>
    <div class="panel__art">
      ${Art({ markup: vignette(p.specimen), className: 'panel__drawing' })}
      <span class="panel__flight">${'FLIGHT ' + p.flight}</span>
    </div>
    ${Plate({ n: p.n, title: p.title, size: 'sm', id: 'ch-' + p.slug })}
    <p class="panel__meta">${p.kind} · ${p.year}</p>
    <p class="panel__stand">${p.standfirst}</p>
    ${Tags({ items: p.tags.slice(0, 4) })}
    <div class="panel__foot">
      <a class="panel__link go" href=${'project.html?p=' + p.slug}>Read chapter ${p.n}<span class="go__arrow" aria-hidden="true">→</span></a>
    </div>
  </article>`;
}

export function Chapters({ projects }) {
  return html`<div class="chapters">
    ${projects.map((p, i) => ChapterPanel({ project: p, span: SPANS[i % SPANS.length], i }))}
  </div>`;
}

export function Command({ md }) {
  return html`<section class="command" aria-labelledby="command-title" id="command">
    <div class="command__in page">
      <div class="running-head running-head--band" aria-hidden="true"><span class="running-head__folio">Special feature</span><span>Current command</span></div>
      <div class="command__grid">
        <div class="command__copy">
          <p class="command__kicker"><span class="live-dot" aria-hidden="true"></span>CURRENT COMMAND · SINCE ${md.since.toUpperCase()}</p>
          <h2 class="command__title" id="command-title">${md.name}</h2>
          <p class="command__role">${md.role}</p>
          <p class="command__stand">${md.standfirst}</p>
          <a class="btn btn--band" href=${md.url} target="_blank" rel="noopener">Visit molddetect.app<span aria-hidden="true">→</span></a>
        </div>
        <div class="command__side">${Art({ markup: mouldArt(), className: 'command__art' })}</div>
      </div>
      <figure class="command__how" aria-labelledby="command-how-title">
        <p class="command__sub">${md.how.kicker}</p>
        <h3 class="command__how-title" id="command-how-title">${md.how.title}</h3>
        <p class="command__how-lede">${md.how.lede}</p>
        ${Art({ markup: mouldFlow(md.how), className: 'command__flow' })}
        <figcaption class="command__how-cap">${md.how.source}</figcaption>
      </figure>
      <div class="command__grid command__grid--lower">
        <div>
          <h3 class="command__sub">What has been built</h3>
          <ol class="command__built">${md.built.map((b) => html`<li>${b}</li>`)}</ol>
          <p class="command__result">${md.result}</p>
        </div>
        <div class="command__side">${Facts({ title: 'Log of the command', rows: md.facts })}</div>
      </div>
    </div>
  </section>`;
}

/** Pre-rendered ink + blue halftone of a talk photo (assets/photos/halftone.py). */
const halftone = (src) => src.replace(/\.jpe?g$/, '-halftone.png');

function TalkCard({ talk: t, i }) {
  return html`<article class="talk reveal" style=${'--i:' + i} aria-labelledby=${'talk-' + i}>
    <figure class="talk__photo">
      <img src=${halftone(t.photo)} alt=${t.alt} width="1400" height=${i === 0 ? 1050 : 994} loading="lazy" decoding="async">
    </figure>
    <p class="talk__strip"><span>${t.when}</span><span>${t.host}</span><span>${t.venue}</span></p>
    <h3 class="talk__title" id=${'talk-' + i}>${t.title}</h3>
    ${Tags({ items: [t.topic] })}
    <p class="talk__note">${t.note}</p>
  </article>`;
}

export function Talks({ talks }) {
  const featured = talks.filter((t) => t.photo);
  const rest = talks.filter((t) => !t.photo);
  return html`<div class="talks">
    <div class="talks__feature">${featured.map((t, i) => TalkCard({ talk: t, i }))}</div>
    <h3 class="sub-head">Past events</h3>
    <table class="timetable reveal">
      <caption class="visually-hidden">Further talks: title, event, topic and date</caption>
      <thead><tr><th scope="col">Title</th><th scope="col">Event</th><th scope="col">Topic</th><th scope="col">Date</th></tr></thead>
      <tbody>${rest.map((t) => html`<tr>
        <th scope="row" data-label="Title">${t.title}${t.video ? html` <a class="talk__video" href=${t.video} target="_blank" rel="noopener">${t.linkLabel || 'Watch the talk'}<span aria-hidden="true"> ↗</span><span class="visually-hidden"> (${t.linkSite || 'YouTube'}, opens in a new tab)</span></a>` : null}${t.note ? html`<small>${t.note}</small>` : null}</th>
        <td data-label="Event">${t.host}</td>
        <td data-label="Topic">${t.topic}</td>
        <td data-label="Date" class="mono">${t.when || '—'}</td>
      </tr>`)}</tbody>
    </table>
  </div>`;
}

export function SkyportPass() {
  return html`<article class="pass reveal" aria-labelledby="skyport-title">
    <div class="pass__main">
      <p class="pass__kicker"><span>BOARDING PASS</span><span>BONUS CHAPTER</span></p>
      <h2 class="pass__title" id="skyport-title">The Skyport of Tomorrow</h2>
      <p class="pass__text">An airport lounge as 1958 imagined 2062. Walk your robot between broadcast monitors, one per chapter, and step up to any of them to open its story. Built in Three.js.</p>
      <dl class="pass__grid">
        <div><dt>PASSENGER</dt><dd>YOU</dd></div>
        <div><dt>FLIGHT</dt><dd>SK-62</dd></div>
        <div><dt>GATE</dt><dd>2062</dd></div>
        <div><dt>SEAT</dt><dd>1A</dd></div>
      </dl>
      <div><a class="btn" href="lounge.html">Board the lounge<span aria-hidden="true">→</span></a></div>
    </div>
    <div class="pass__stub">
      ${Art({ markup: skyportArt(), className: 'pass__art' })}
      <div class="pass__barcode" aria-hidden="true"></div>
    </div>
  </article>`;
}

export function Letters({ links }) {
  const rows = [
    ['Email', 'mailto:' + links.email, links.email],
    ['LinkedIn', links.linkedin, 'in/rozariochivers'],
    ['GitHub', links.github, 'github.com/flipflop'],
    ['Behance', links.behance, 'behance.net/rozario']
  ];
  return html`<ul class="letters">
    ${rows.map(([k, href, v]) => html`<li><a href=${href} target=${href.startsWith('http') ? '_blank' : null} rel=${href.startsWith('http') ? 'noopener' : null}>
      <span class="letters__k">${k.toUpperCase()}</span><span class="letters__v">${v}</span><span class="go__arrow" aria-hidden="true">→</span>
    </a></li>`)}
  </ul>`;
}
