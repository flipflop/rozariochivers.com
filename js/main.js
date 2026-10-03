/**
 * main.js — the only orchestrator for index.html.
 * Builds each section from the data modules, mounts it into its static slot,
 * then wires motion (split-flap, reveal, parallax, clock). Components stay pure.
 */
import { html, mount, $ } from './util/html.js';
import { PROJECTS } from './data/projects.js';
import { PROFILE, CAREER, FIGURES, TICKER, LINKS, MOULD_DETECT, EARLIER_EMPLOYERS, TALKS, INNOVATION } from './data/profile.js?v=20261004d';
import { ArtDefs, coverArt } from './components/illustrations.js';
import { Art, RunningHead, SectionHead } from './components/ui.js';
import { Board, Ticker, runFlaps } from './components/board.js';
import { Chapters, Command, SkyportPass, Letters, Talks } from './components/sections.js?v=20261003j';
import { Featured } from './components/blog.js?v=20261004a';
import { sortedPosts } from './data/posts.js?v=20261004a';
import { Figures } from './components/figures.js?v=20261004e';
import { RouteMap, Legs, Record, Capabilities } from './components/pilot.js?v=20261004a';
import { reducedMotion, observeReveal, parallax } from './util/motion.js';

const slot = (k) => $(`[data-slot="${k}"]`);

/** Framed product thumbnail: ink rule, blue offset, caption strip. */
const Thumb = (t) => t ? html`<figure class="thumb">
  <picture><source type="image/webp" srcset=${t.src + '.webp'}><img src=${t.src + '.jpg'} alt=${t.alt} width=${t.w} height=${t.h} loading="lazy" decoding="async"></picture>
  <figcaption class="thumb__cap">${t.cap}</figcaption></figure>` : null;

function Pilot() {
  return html`<div>
    ${SectionHead({ id: 'pilot-title', kicker: 'About the author', title: 'The Pilot', lede: PROFILE.title })}
    <div class="pilot__intro">
      <div class="pilot__summary">
        ${PROFILE.summary.map((p) => html`<p>${p}</p>`)}
        <aside class="pilot__app" aria-labelledby="tc-title">
          <h3 class="pilot__app-t" id="tc-title">${PROFILE.themeClock.title}</h3>
          ${Thumb(PROFILE.themeClock.thumb)}
          ${PROFILE.themeClock.text.map((p) => html`<p>${p}</p>`)}
          <p class="pilot__app-co">Co-created with ${PROFILE.themeClock.cocreator.name}: <a href=${PROFILE.themeClock.cocreator.linkedin} target="_blank" rel="noopener">LinkedIn</a> · <a href=${PROFILE.themeClock.cocreator.github} target="_blank" rel="noopener">GitHub</a></p>
          <ul class="pilot__app-links">${PROFILE.themeClock.links.map((l) => html`<li><a href=${l.href} target="_blank" rel="noopener">${l.label}<span aria-hidden="true"> ↗</span></a></li>`)}</ul>
        </aside>
        <aside class="pilot__app" aria-labelledby="pub-title">
          <h3 class="pilot__app-t" id="pub-title">${PROFILE.publishing.title}</h3>
          ${Thumb(PROFILE.publishing.thumb)}
          ${PROFILE.publishing.text.map((p) => html`<p>${p}</p>`)}
          <ul class="pilot__app-links">${PROFILE.publishing.links.map((l) => html`<li><a href=${l.href} target="_blank" rel="noopener">${l.label}<span aria-hidden="true"> ↗</span></a></li>`)}</ul>
        </aside>
        <blockquote class="pull pilot__motto"><p>${PROFILE.motto}</p></blockquote>
      </div>
      ${Record({ profile: PROFILE })}
    </div>
    <h3 class="sub-head">Route chart · three decades in-flight</h3>
    ${RouteMap({ career: CAREER })}
    ${Legs({ career: CAREER, earlier: EARLIER_EMPLOYERS })}
    <h3 class="sub-head">Key Capabilities</h3>
    ${Capabilities({ items: PROFILE.capabilities })}
  </div>`;
}

function render() {
  const defs = $('#art-defs'); defs.outerHTML = ArtDefs;
  mount($('[data-art="cover"]'), Art({ markup: coverArt(), className: 'cover__drawing' }));
  const stand = $('[data-standfirst]'); if (stand) stand.textContent = PROFILE.standfirst;

  [['rh-exp', 2, 'left'], ['rh-promo', 3, 'right'], ['rh-2', 4, 'left'], ['rh-6', 8, 'left'], ['rh-36', 38, 'left'], ['rh-48', 50, 'right'], ['rh-56', 58, 'left'], ['rh-62', 64, 'left'], ['rh-64', 66, 'right']]
    .forEach(([k, folio, side]) => mount(slot(k), RunningHead({ folio, side })));

  mount(slot('experiments'), html`<div>
    ${SectionHead({ id: 'experiments-title', kicker: 'Field notes', title: 'Rozario’s Technology Experiments', lede: 'Field notes from the workshop: things I’m building, breaking and learning, mostly about agents.' })}
    ${Featured({ post: sortedPosts()[0] })}
  </div>`);
  mount(slot('board'), Board({ projects: PROJECTS }));
  mount(slot('ticker'), Ticker({ items: TICKER }));
  mount(slot('chapters'), html`<div>
    ${SectionHead({ id: 'chapters-title', kicker: 'Part one', title: 'Eight chapters', lede: 'Side projects across four decades, each written up from its own repository, with a working specimen inside.' })}
    ${Chapters({ projects: PROJECTS })}
  </div>`);
  mount(slot('command'), Command({ md: MOULD_DETECT }));
  mount(slot('figures'), html`<div>
    ${SectionHead({ id: 'figures-title', kicker: 'Part two', title: 'Impact and ROI', lede: 'Thirty years across insurance, banking, fintech and start-ups, in numbers.' })}
    ${Figures({ figures: FIGURES, innovation: INNOVATION })}
  </div>`);
  mount(slot('pilot'), Pilot());
  mount(slot('talks'), html`<div>
    ${SectionHead({ id: 'talks-title', kicker: 'On the platform', title: 'Tech Events and Meetups', lede: 'Rozario has presented at engineering and design community events, on topics from micro frontends and design systems through to innovation culture and digital transformation.' })}
    ${Talks({ talks: TALKS })}
  </div>`);
  mount(slot('skyport'), SkyportPass());
  mount(slot('contact'), html`<div>
    ${SectionHead({ id: 'contact-title', kicker: 'Correspondence', title: 'Contact Rozario', lede: 'For CTO, Digital Technology advisory, Design Systems, Accessibility and AI-engineering conversations.' })}
    ${Letters({ links: LINKS })}
  </div>`);
}

function clock() {
  const el = $('[data-clock]'); if (!el) return;
  const fmt = new Intl.DateTimeFormat('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Australia/Sydney' });
  const set = () => { el.textContent = fmt.format(new Date()) + ' SYD'; };
  set(); setInterval(set, 30000);
}

function wireBoard() {
  const board = $('.board'); if (!board) return;
  const reduced = reducedMotion();
  if (reduced || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { io.disconnect(); runFlaps(board); } }, { threshold: 0.3 });
  io.observe(board);
}

render();
clock();
wireBoard();
observeReveal();
parallax([...document.querySelectorAll('[data-depth]')]);
const tick = $('.ticker__list'); if (tick) $('.ticker').style.setProperty('--tick-dur', Math.round(tick.scrollWidth / 70) + 's');

const promo = $('.promo');
if (promo && 'IntersectionObserver' in window) new IntersectionObserver((en) => en.forEach((e) => e.target.classList.toggle('is-in', e.isIntersecting))).observe(promo);

// Feature videos: play muted while on screen, never under reduced motion (poster frame stays).
(() => {
  const vids = document.querySelectorAll('.feature__video video');
  if (!vids.length || matchMedia('(prefers-reduced-motion: reduce)').matches) { vids.forEach((v) => { v.controls = true; }); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) e.target.play().catch(() => {}); else e.target.pause(); }), { threshold: 0.4 });
  vids.forEach((v) => io.observe(v));
})();
