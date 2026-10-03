/**
 * project.js — orchestrator for project.html?p=<slug>.
 * Renders the article from PROJECTS, then lazy-loads the chapter's specimen:
 * when `.specimen[data-specimen]` nears the viewport, `js/specimens/<key>.js` is
 * imported and its `mount(el, project, { reduced })` is called (contract in docs/HANDOFF.md).
 */
import { html, mount, $ } from './util/html.js';
import { PROJECTS } from './data/projects.js';
import { ArtDefs, vignette } from './components/illustrations.js';
import { Art, RunningHead, Plate, Facts, Tags } from './components/ui.js';
import { reducedMotion, observeReveal, onVisible } from './util/motion.js';

function Article(p) {
  const i = PROJECTS.indexOf(p);
  const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  const half = Math.ceil(p.body.length / 2);
  const section = (s) => html`<section><h2>${s.h}</h2>${s.p.map((t) => html`<p>${t}</p>`)}</section>`;
  const isRepoOnly = p.live === p.source;

  return html`<article aria-labelledby="chapter-title">
    ${RunningHead({ folio: String(p.n * 8 + 2), side: p.n % 2 ? 'right' : 'left' })}
    <header class="article-hero">
      <div>
        ${Plate({ n: p.n, title: p.title, size: 'lg', tag: 'h1', id: 'chapter-title' })}
        <p class="article-hero__meta"><span>Flight ${p.flight}</span><span>${p.kind}</span><span>${p.year}</span></p>
        <p class="article-hero__stand">${p.standfirst}</p>
      </div>
      ${Art({ markup: vignette(p.specimen), className: 'article-hero__art' })}
    </header>

    <section class="article-specimen" aria-labelledby="specimen-title">
      <div class="specimen-frame">
        <div class="specimen-frame__bar">
          <span id="specimen-title"><span class="live-dot" aria-hidden="true"></span>SPECIMEN NO. ${p.n} · LIVE</span>
          <span>${p.specimen.toUpperCase()}</span>
        </div>
        <div class="specimen" data-specimen=${p.specimen}>
          <p class="specimen__placeholder">Specimen ${p.n} loads when it comes into view.</p>
        </div>
        <p class="specimen-frame__cap">A working illustration of the idea, built for this page. For the real project, see the links beside the article.</p>
      </div>
    </section>

    <div class="article-grid">
      <div class="article-body">
        ${p.body.slice(0, half).map(section)}
        <blockquote class="pull"><p>${p.pull}</p></blockquote>
        ${p.body.slice(half).map(section)}
      </div>
      <aside class="article-side" aria-label="Chapter facts">
        ${Facts({ title: 'Facts of the flight', rows: p.facts })}
        <div class="article-links">
          ${isRepoOnly ? null : html`<a class="btn" href=${p.live} target="_blank" rel="noopener">Live<span aria-hidden="true">↗</span></a>`}
          <a class=${isRepoOnly ? 'btn' : 'btn btn--ghost'} href=${p.source} target="_blank" rel="noopener">Source<span aria-hidden="true">↗</span></a>
        </div>
        ${Tags({ items: p.tags })}
      </aside>
    </div>

    <nav class="chapter-nav" aria-label="Chapters">
      <a href=${'project.html?p=' + prev.slug}><span class="chapter-nav__k">← PREVIOUS CHAPTER</span>${Plate({ n: prev.n, title: prev.title, size: 'sm', tag: 'h2' })}</a>
      <a href=${'project.html?p=' + next.slug}><span class="chapter-nav__k">NEXT CHAPTER →</span>${Plate({ n: next.n, title: next.title, size: 'sm', tag: 'h2' })}</a>
    </nav>
  </article>`;
}

async function loadSpecimen(el, project) {
  try {
    const mod = await import(`./specimens/${el.dataset.specimen}.js?v=20261003f`);
    const placeholder = el.querySelector('.specimen__placeholder');
    const out = mod.mount(el, project, { reduced: reducedMotion() });
    // A specimen that renders anything replaces the placeholder itself; stubs leave it.
    if (el.children.length > 1 && placeholder) placeholder.remove();
    return out;
  } catch (err) {
    console.error('Specimen failed to load', err);
  }
}

function render() {
  $('#art-defs').outerHTML = ArtDefs;
  const slug = new URLSearchParams(location.search).get('p');
  const p = PROJECTS.find((x) => x.slug === slug) || PROJECTS[0];
  document.title = `${p.n}. ${p.title} · Technology Facts and Figures, 2026`;
  document.querySelector('meta[name="description"]').setAttribute('content', p.standfirst);
  mount($('#main'), Article(p));
  const el = $('.specimen[data-specimen]');
  if (el) onVisible(el, () => loadSpecimen(el, p));
  observeReveal();
}

render();
