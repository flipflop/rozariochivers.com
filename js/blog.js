/** blog.js — orchestrator for blog.html: lists every dispatch. */
import { html, mount, $ } from './util/html.js';
import { sortedPosts, dispatchNo } from './data/posts.js?v=20261004a';
import { ArtDefs } from './components/illustrations.js';
import { RunningHead, SectionHead } from './components/ui.js';
import { DispatchCard } from './components/blog.js?v=20261004a';
import { observeReveal } from './util/motion.js';

$('#art-defs').outerHTML = ArtDefs;
mount($('#main'), html`<div>
  ${RunningHead({ folio: '70', side: 'left' })}
  ${SectionHead({ id: 'blog-title', kicker: 'Field notes', title: 'Rozario’s Technology Experiments', lede: 'Field notes from the workshop: things I’m building, breaking and learning, mostly about agents.' })}
  <div class="dcards">${sortedPosts().map((post) => DispatchCard({ post, n: dispatchNo(post) }))}</div>
</div>`);
observeReveal();
