/**
 * post.js — orchestrator for post.html?p=<slug>. Renders a dispatch from POSTS.
 */
import { html, mount, $ } from './util/html.js';
import { POSTS, sortedPosts, dispatchNo, fmtDate, slugify } from './data/posts.js?v=20261004a';
import { ArtDefs, heroArt } from './components/illustrations.js';
import { Art, RunningHead, Plate, Facts, Tags } from './components/ui.js';
import { PostBody } from './components/blog.js?v=20261004a';
import { observeReveal } from './util/motion.js';

const kind = (p) => (p.status ? 'Experiment' : 'Dispatch');

function Article(p) {
  const list = sortedPosts();
  const i = list.indexOf(p);
  const newer = list[i - 1], older = list[i + 1];
  const n = dispatchNo(p);
  const heads = p.body.filter((b) => b.h);
  const link = (q, k) => html`<a href=${'post.html?p=' + q.slug}><span class="chapter-nav__k">${k}</span>${Plate({ n: dispatchNo(q), title: q.title, size: 'sm', tag: 'h2' })}</a>`;
  return html`<article aria-labelledby="post-title">
    ${RunningHead({ folio: String(n * 2 + 70), side: n % 2 ? 'right' : 'left' })}
    <header class="article-hero post-hero">
      <div>
        <p class="post-kind">${kind(p)} No. ${n}</p>
        ${Plate({ n, title: p.title, size: 'lg', tag: 'h1', id: 'post-title' })}
        <p class="article-hero__meta"><span>${fmtDate(p.date)}</span><span>${p.readMins} min read</span>${p.status ? html`<span>${p.status}</span>` : null}</p>
        <p class="article-hero__stand">${p.dek}</p>
        ${Tags({ items: p.tags })}
      </div>
      ${Art({ markup: heroArt(p.hero), className: 'article-hero__art' })}
    </header>
    <div class="article-grid post-grid">
      ${PostBody({ blocks: p.body })}
      <aside class="article-side" aria-label="About this dispatch">
        ${heads.length ? html`<nav class="post-toc" aria-label="In this dispatch"><p class="shows__k">In this dispatch</p><ol>${heads.map((b) => html`<li><a href=${'#' + slugify(b.h)}>${b.h}</a></li>`)}</ol></nav>` : null}
        ${p.facts ? Facts({ title: 'Facts', rows: p.facts }) : null}
        <a class="go" href="blog.html">All experiments<span class="go__arrow" aria-hidden="true">→</span></a>
      </aside>
    </div>
    <nav class="chapter-nav" aria-label="Dispatches">
      ${older ? link(older, '← PREVIOUS DISPATCH') : html`<a href="blog.html"><span class="chapter-nav__k">← BACK</span><span class="post-back">All experiments</span></a>`}
      ${newer ? link(newer, 'NEXT DISPATCH →') : html`<a href="index.html#experiments"><span class="chapter-nav__k">HOME →</span><span class="post-back">Back to the almanac</span></a>`}
    </nav>
  </article>`;
}

function meta(p) {
  document.title = `${p.title} · Technology Facts and Figures, 2026`;
  document.querySelector('meta[name="description"]').setAttribute('content', p.dek);
  const url = 'post.html?p=' + p.slug;
  document.querySelector('link[rel="canonical"]').setAttribute('href', url);
  const ld = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.dek, datePublished: p.date, dateModified: p.date, keywords: p.tags.join(', '), mainEntityOfPage: url, author: { '@type': 'Person', name: 'Rozario Chivers' } };
  const s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(ld);
  document.head.appendChild(s);
}

function render() {
  $('#art-defs').outerHTML = ArtDefs;
  const slug = new URLSearchParams(location.search).get('p');
  const p = POSTS.find((x) => x.slug === slug) || sortedPosts()[0];
  meta(p);
  mount($('#main'), Article(p));
  observeReveal();
}

render();
