/** Specimen: entropy — a grid lit by random bits, with a "plant" marker and a heat overlay. */
import { tok, frag, fitCanvas, loop } from './_util.js';

const N = 32;            // grid is N x N (1,024 cells = 10 bits per cell index)
const R = 4;             // "near the plant" radius in cells

export function mount(el, project, { reduced = false } = {}) {
  try {
    const T = tok();
    const root = frag(`<div class="sp-entropy">
      <div class="sp-entropy__bar">
        <button class="btn btn--ghost" type="button" data-mic aria-pressed="false">Use microphone</button>
        <button class="btn btn--ghost" type="button" data-step hidden>Draw 256 bits</button>
        <label class="sp-entropy__tog"><input type="checkbox" data-heat checked> Heat overlay</label>
        <span class="sp-entropy__src caps" data-src aria-live="polite">SOURCE · crypto.getRandomValues</span>
      </div>
      <div class="sp-entropy__stage"><canvas tabindex="0" role="application" aria-label="Entropy grid. Drag the red plant marker, or focus the grid and use the arrow keys to move it."></canvas></div>
      <dl class="sp-entropy__read mono">
        <div><dt>CELLS LIT</dt><dd data-n>0</dd></div>
        <div><dt>NEAR PLANT</dt><dd data-obs>0</dd></div>
        <div><dt>EXPECTED</dt><dd data-exp>0</dd></div>
        <div><dt>Z-SCORE</dt><dd data-z>0.00</dd></div>
      </dl>
      <p class="sp-note">Thought experiment, as in the project: this tests nothing and claims no effect. For true random bits, any cluster at the plant is chance, and the Z-score should wander around zero. The real project grids are 20×20, 50×50 and 100×100; this one is 32×32.</p>
    </div>`);
    el.replaceChildren(root);
    const cv = root.querySelector('canvas'), stage = root.querySelector('.sp-entropy__stage');
    const q = (s) => root.querySelector(s);
    const counts = new Uint32Array(N * N), flash = new Float32Array(N * N);
    let total = 0, size = 0, ctx, plant = { x: N * 0.7, y: N * 0.3 }, drag = false, mic = null, bitBuf = [], stopLoop = null, dirty = true;
    const dead = new AbortController(), sig = { signal: dead.signal };

    const draw = () => {
      dirty = false;
      const cs = size / N;
      ctx.fillStyle = T.paper; ctx.fillRect(0, 0, size, size);
      const showHeat = q('[data-heat]').checked;
      let max = 1; for (let i = 0; i < counts.length; i++) if (counts[i] > max) max = counts[i];
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const i = y * N + x, f = flash[i];
        if (showHeat && total) { ctx.globalAlpha = Math.min(0.85, (counts[i] / max) ** 1.5 * 0.85); ctx.fillStyle = T.blue; ctx.fillRect(x * cs, y * cs, cs, cs); ctx.globalAlpha = 1; }
        if (f > 0.02) { ctx.globalAlpha = Math.min(1, f); ctx.fillStyle = T.ink; ctx.fillRect(x * cs + 1, y * cs + 1, cs - 2, cs - 2); ctx.globalAlpha = 1; }
      }
      ctx.strokeStyle = T.paper3; ctx.lineWidth = 1; ctx.beginPath();
      for (let k = 0; k <= N; k++) { ctx.moveTo(k * cs + .5, 0); ctx.lineTo(k * cs + .5, size); ctx.moveTo(0, k * cs + .5); ctx.lineTo(size, k * cs + .5); }
      ctx.stroke();
      ctx.strokeStyle = T.ink; ctx.lineWidth = 2; ctx.strokeRect(1, 1, size - 2, size - 2);
      // plant marker: radius ring + stem + leaf
      const px = plant.x * cs, py = plant.y * cs;
      ctx.setLineDash([4, 4]); ctx.strokeStyle = T.red; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(px, py, R * cs, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = T.red; ctx.beginPath(); ctx.arc(px, py, 7, 0, 7); ctx.fill();
      ctx.fillStyle = T.paper; ctx.font = `600 9px ${T.cond}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('P', px, py + .5);
      if (document.activeElement === cv) { ctx.strokeStyle = T.ink; ctx.lineWidth = 2; ctx.setLineDash([6, 3]); ctx.strokeRect(4, 4, size - 8, size - 8); ctx.setLineDash([]); }
    };

    const stats = () => {
      let obs = 0, cells = 0;
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const dx = x + .5 - plant.x, dy = y + .5 - plant.y;
        if (dx * dx + dy * dy <= R * R) { obs += counts[y * N + x]; cells++; }
      }
      const p = cells / (N * N), exp = total * p, sd = Math.sqrt(total * p * (1 - p)) || 1;
      q('[data-n]').textContent = total.toLocaleString();
      q('[data-obs]').textContent = obs.toLocaleString();
      q('[data-exp]').textContent = exp.toFixed(1);
      q('[data-z]').textContent = total ? ((obs - exp) / sd).toFixed(2) : '0.00';
    };

    // 10 bits -> a cell index (N*N = 1024, so no modulo bias)
    const light = (idx) => { counts[idx]++; flash[idx] = 1; total++; };
    const drawBatch = (cells) => {
      if (mic) {
        let k = 0;
        while (k < cells && bitBuf.length >= 10) { let v = 0; for (let b = 0; b < 10; b++) v = (v << 1) | bitBuf.pop(); light(v); k++; }
        if (bitBuf.length > 20000) bitBuf.length = 2000;
      } else {
        const a = new Uint16Array(cells); crypto.getRandomValues(a);
        for (let k = 0; k < cells; k++) light(a[k] & 1023);
      }
      dirty = true; stats();
    };

    const resize = () => {
      size = Math.max(200, Math.min(stage.clientWidth || 400, 480));
      ({ ctx } = fitCanvas(cv, size, size)); dirty = true;
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(stage);

    // dragging the plant
    const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: Math.max(0, Math.min(N, (e.clientX - r.left) / r.width * N)), y: Math.max(0, Math.min(N, (e.clientY - r.top) / r.height * N)) }; };
    cv.addEventListener('pointerdown', (e) => { drag = true; cv.setPointerCapture(e.pointerId); plant = pos(e); dirty = true; stats(); }, sig);
    cv.addEventListener('pointermove', (e) => { if (!drag) return; plant = pos(e); dirty = true; stats(); }, sig);
    cv.addEventListener('pointerup', () => { drag = false; }, sig);
    cv.addEventListener('keydown', (e) => {
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (!d) return; e.preventDefault();
      plant = { x: Math.max(0, Math.min(N, plant.x + d[0])), y: Math.max(0, Math.min(N, plant.y + d[1])) }; dirty = true; stats();
    }, sig);
    cv.addEventListener('focus', () => { dirty = true; }, sig); cv.addEventListener('blur', () => { dirty = true; }, sig);
    q('[data-heat]').addEventListener('change', () => { dirty = true; }, sig);

    // microphone: LSBs of 16-bit-quantised samples, Von Neumann debiased
    const micBtn = q('[data-mic]'), src = q('[data-src]');
    if (!navigator.mediaDevices?.getUserMedia) micBtn.hidden = true;
    const stopMic = () => {
      if (!mic) return;
      mic.stream.getTracks().forEach((t) => t.stop()); mic.node.disconnect(); mic.ac.close().catch(() => {});
      mic = null; bitBuf = []; micBtn.setAttribute('aria-pressed', 'false'); micBtn.textContent = 'Use microphone';
      src.textContent = 'SOURCE · crypto.getRandomValues';
    };
    micBtn.addEventListener('click', async () => {
      if (mic) return stopMic();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
        const ac = new (window.AudioContext || window.webkitAudioContext)();
        const s = ac.createMediaStreamSource(stream), node = ac.createScriptProcessor(4096, 1, 1), mute = ac.createGain();
        mute.gain.value = 0;
        node.onaudioprocess = (ev) => {
          const d = ev.inputBuffer.getChannelData(0);
          for (let i = 0; i + 1 < d.length; i += 2) {
            const a = Math.round(d[i] * 32768) & 1, b = Math.round(d[i + 1] * 32768) & 1;
            if (a !== b) bitBuf.push(a);     // Von Neumann: 01 -> 0, 10 -> 1, equal pairs dropped
          }
        };
        s.connect(node); node.connect(mute); mute.connect(ac.destination);
        mic = { stream, ac, node };
        micBtn.setAttribute('aria-pressed', 'true'); micBtn.textContent = 'Stop microphone';
        src.textContent = 'SOURCE · MIC LSBs, DEBIASED';
      } catch (err) { src.textContent = 'MIC UNAVAILABLE · USING crypto.getRandomValues'; }
    }, sig);

    const stepBtn = q('[data-step]');
    if (reduced) {
      stepBtn.hidden = false;
      stepBtn.addEventListener('click', () => { flash.fill(0); drawBatch(256); draw(); }, sig);
      drawBatch(1500); flash.fill(0); draw();
    } else {
      stopLoop = loop(() => {
        for (let i = 0; i < flash.length; i++) if (flash[i] > 0) { flash[i] *= 0.9; dirty = true; }
        drawBatch(24); if (dirty) draw();
      });
    }
    stats(); draw();
    return () => { dead.abort(); ro.disconnect(); stopLoop && stopLoop(); stopMic(); };
  } catch (err) { console.warn('entropy specimen', err); }
}
