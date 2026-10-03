/** Shared helpers for specimens (not a specimen itself). */
export const tok = () => {
  const cs = getComputedStyle(document.documentElement);
  const g = (n, d) => cs.getPropertyValue(n).trim() || d;
  return {
    paper: g('--paper', '#F1ECDF'), paper2: g('--paper-2', '#E8E1CF'), paper3: g('--paper-3', '#DCD3BD'),
    ink: g('--ink', '#161616'), ink2: g('--ink-2', '#3A3833'), ink3: g('--ink-3', '#5E5A50'),
    blue: g('--blue', '#7DB6D8'), blueDeep: g('--blue-deep', '#4F8DB3'), red: g('--red', '#C8452E'),
    mono: g('--f-mono', 'monospace'), cond: g('--f-cond', 'sans-serif')
  };
};

/** Build an element from an HTML string (static markup only). */
export const frag = (s) => { const t = document.createElement('template'); t.innerHTML = s.trim(); return t.content.firstElementChild; };

/** Size a canvas to its CSS box at devicePixelRatio; returns { ctx, w, h }. */
export function fitCanvas(c, w, h) {
  const d = Math.min(window.devicePixelRatio || 1, 2);
  c.width = Math.round(w * d); c.height = Math.round(h * d);
  c.style.width = w + 'px'; c.style.height = h + 'px';
  const ctx = c.getContext('2d'); ctx.setTransform(d, 0, 0, d, 0, 0);
  return { ctx, w, h };
}

/** Run fn on every frame while mounted and visible; returns stop(). */
export function loop(fn) {
  let id = 0, last = 0, on = true;
  const tick = (t) => { if (!on) return; try { fn(t, t - last); } catch (e) { on = false; console.warn('specimen loop stopped', e); return; } last = t; id = requestAnimationFrame(tick); };
  id = requestAnimationFrame(tick);
  return () => { on = false; cancelAnimationFrame(id); };
}

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
