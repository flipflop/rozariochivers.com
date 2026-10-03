/**
 * Motion helpers shared by every page.
 *   reducedMotion()          live check of prefers-reduced-motion
 *   observeReveal(root)      adds .is-in to .reveal / .chart when 12% visible (once)
 *   onVisible(el, fn, opts)  calls fn(el) once when el first nears the viewport (lazy-init)
 *   parallax(els)            gentle translateY on [data-depth] layers; skipped when reduced
 */
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function observeReveal(root = document) {
  const els = root.querySelectorAll('.reveal, .chart');
  if (!('IntersectionObserver' in window) || reducedMotion()) { els.forEach((e) => e.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
  els.forEach((e) => io.observe(e));
}

export function onVisible(el, fn, { rootMargin = '200px' } = {}) {
  if (!('IntersectionObserver' in window)) { fn(el); return; }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); fn(el); }
  }, { rootMargin });
  io.observe(el);
}

export function parallax(els) {
  if (reducedMotion() || !els.length) return;
  let raf = 0;
  const update = () => {
    raf = 0;
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      const off = (r.top + r.height / 2 - innerHeight / 2) * (parseFloat(el.dataset.depth) || 0.05);
      el.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0)`;
    });
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  update();
}
