/**
 * Blog components — pure props -> DOM node functions.
 *
 *   Featured({ post })   homepage "latest dispatch" card
 *   DispatchCard({ post, n })   blog-index card
 *   PostBody({ blocks })  renders body blocks; headings get anchor ids
 */
import { html } from '../util/html.js';
import { Art, Tags } from './ui.js';
import { heroArt } from './illustrations.js';
import { orchestraArchitecture } from './diagrams.js?v=20261003j';

const DIAGRAMS = { orchestra: orchestraArchitecture };
import { fmtDate, slugify } from '../data/posts.js?v=20261004a';

export function Featured({ post }) {
  return html`<article class="feature reveal" aria-labelledby="feature-title">
    ${post.video
      ? html`<figure class="feature__video"><video src=${post.video.src} poster=${post.video.poster} muted loop playsinline preload="none" aria-label=${post.video.alt}></video><figcaption class="thumb__cap">${post.video.cap}</figcaption></figure>`
      : Art({ markup: heroArt(post.hero), className: 'feature__art' })}
    <div class="feature__copy">
      <p class="feature__kicker"><span class="live-dot" aria-hidden="true"></span>LATEST DISPATCH · ${fmtDate(post.date).toUpperCase()}</p>
      <h3 class="feature__title" id="feature-title">${post.title}</h3>
      <p class="feature__dek">${post.dek}</p>
      <p class="feature__summary">${post.summary}</p>
      <div class="feature__cta">
        <a class="btn" href=${'post.html?p=' + post.slug}>Read the dispatch →</a>
        <a class="go" href="blog.html">All experiments<span class="go__arrow" aria-hidden="true">→</span></a>
      </div>
    </div>
  </article>`;
}

export function DispatchCard({ post, n }) {
  return html`<article class="dcard reveal">
    <a class="dcard__link" href=${'post.html?p=' + post.slug}>
      ${Art({ markup: heroArt(post.hero), className: 'dcard__art' })}
      <p class="dcard__meta"><span>Dispatch ${n}</span><span>${fmtDate(post.date)}</span><span>${post.readMins} min read</span>${post.status ? html`<span>${post.status}</span>` : null}</p>
      <h2 class="dcard__title">${post.title}</h2>
      <p class="dcard__dek">${post.dek}</p>
    </a>
    ${Tags({ items: post.tags })}
  </article>`;
}

function Block(b) {
  if (b.h) return html`<section class="post-sec" aria-labelledby=${slugify(b.h)}><h2 id=${slugify(b.h)}>${b.h}</h2>${(b.p || []).map((t) => html`<p>${t}</p>`)}</section>`;
  if (b.p) return html`${b.p.map((t) => html`<p>${t}</p>`)}`;
  if (b.diagram && DIAGRAMS[b.diagram]) return html`<figure class="post-fig">
    <p class="post-fig__k">${b.kicker}</p><h3 class="post-fig__t">${b.title}</h3><p class="post-fig__lede">${b.lede}</p>
    ${Art({ markup: DIAGRAMS[b.diagram](), className: 'post-fig__art' })}
    ${b.caption ? html`<figcaption class="post-fig__cap">${b.caption}</figcaption>` : null}
  </figure>`;
  if (b.list) {
    const items = b.list.map((t) => html`<li>${t}</li>`);
    return b.ordered ? html`<ol class="post-list post-list--ol">${items}</ol>` : html`<ul class="post-list">${items}</ul>`;
  }
  if (b.note) return html`<aside class="post-note"><span class="post-note__k">Note</span><p>${b.note}</p></aside>`;
  if (b.code != null) return html`<pre class="post-code" tabindex="0" data-lang=${b.lang || null}><code>${b.code}</code></pre>`;
  if (b.quote) return html`<blockquote class="pull"><p>${b.quote}</p>${b.cite ? html`<cite class="post-cite">${b.cite}</cite>` : null}</blockquote>`;
  return null;
}

export function PostBody({ blocks }) {
  return html`<div class="article-body post-body">${blocks.map(Block)}</div>`;
}
