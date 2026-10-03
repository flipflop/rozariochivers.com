/** Specimen: emote-go — a simulated Stop-hook run showing the three-tier engine choice and the five extraction modes. */
import { frag, esc } from './_util.js';

const SAMPLES = {
  pass: { label: 'Tests pass', emotion: 'happy', lines: ['Ran the test suite.', '42 passed in 3.1s.', 'All checks are green and the build is ready.'] },
  fail: { label: 'A traceback', emotion: 'sad', lines: ['Running the tests.', 'Warning: 2 tests failed.', 'Traceback: KeyError in parser.py line 88.', 'Fix the missing key and re-run.'] },
  explain: { label: 'An explanation', emotion: 'calm', lines: ['The hook reads the last assistant message.', 'It extracts what is worth saying.', 'Important: nothing here ever blocks the session.'] }
};
const MODES = ['verbose', 'summarised', 'important', 'warnings', 'code'];
const extract = (m, s) => {
  const L = s.lines;
  if (m === 'verbose') return L.join(' ');
  if (m === 'summarised') return L[L.length - 1];
  if (m === 'important') { const k = L.filter((l) => /important|fail|passed|traceback|warning/i.test(l)); return (k.length ? k : [L[L.length - 1]]).join(' '); }
  if (m === 'warnings') { const k = L.filter((l) => /warning|traceback|fail/i.test(l)); return k.length ? k.join(' ') : '(nothing to warn about, stays silent)'; }
  return L.join(' ').replace(/\./g, ' dot ').replace(/_/g, ' underscore ').replace(/:/g, ' colon ');
};

export function mount(el, project, { reduced = false } = {}) {
  try {
    const root = frag(`<div class="sp-term sp-go">
      <div class="sp-term__ctl">
        <fieldset><legend class="caps">Claude just said</legend>${Object.entries(SAMPLES).map(([k, v], i) => `<label><input type="radio" name="s" value="${k}" ${i ? '' : 'checked'}> ${v.label}</label>`).join('')}</fieldset>
        <fieldset><legend class="caps">Mode</legend><select aria-label="Extraction mode">${MODES.map((m) => `<option ${m === 'summarised' ? 'selected' : ''}>${m}</option>`).join('')}</select></fieldset>
        <fieldset><legend class="caps">Environment</legend>
          <label><input type="checkbox" data-srv> emote-chat server on :8123</label>
          <label><input type="checkbox" data-mdl checked> model provisioned</label></fieldset>
      </div>
      <pre class="sp-term__out" tabindex="0" aria-live="polite" aria-label="Terminal output"></pre>
      <div class="sp-term__bar"><button class="btn" type="button" data-run>Fire Stop hook</button><label class="mono sp-term__hint"><input type="checkbox" data-snd checked> Play the voice</label><span class="mono sp-term__hint">Pre-recorded samples: emote-chat’s jane voice, rendered locally with the per-emotion TTS. Nothing is installed.</span></div>
      <p class="sp-note sp-note--band">Illustration of the behaviour described in the emote-go README: a text extractor, a sentiment classifier, then one of three tiers, with hooks that never block. The 0.2–0.35 s figure is quoted from the README, not measured here.</p>
    </div>`);
    el.replaceChildren(root);
    const out = root.querySelector('.sp-term__out'), dead = new AbortController(), sig = { signal: dead.signal };
    let timers = []; const audio = new Audio(); audio.preload = 'auto';
    const val = (s) => root.querySelector(s);
    const plan = () => {
      const k = root.querySelector('input[name=s]:checked').value, s = SAMPLES[k], mode = val('select').value, srv = val('[data-srv]').checked, mdl = val('[data-mdl]').checked;
      const spoken = extract(mode, s);
      const tier = srv ? ['tier 1', 'emote-chat server found on :8123, healthy', 'full voice catalogue, warm model'] : mdl ? ['tier 2', 'no server; using embedded sherpa-onnx pocket-tts', 'on-device, cgo, no network'] : null;
      const L = [['', '$ # Claude Code Stop hook fires'], ['ok', `extract    mode=${mode}`], ['', `           "${spoken}"`], ['ok', `sentiment  ${s.emotion}`]];
      if (tier) { L.push(['ok', `engine     ${tier[0]}: ${tier[1]}`], ['', `           ${tier[2]}`], ['ok', 'speak      per-emotion voice, sentence by sentence'], ['ok', 'hook       exit 0']); }
      else L.push(['warn', 'engine     tier 3: no server and no model'], ['warn', '           friendly provisioning prompt; hook stays silent'], ['ok', 'hook       exit 0 (hooks never get in the way)']);
      if (mode === 'warnings' && spoken.startsWith('(')) { L.splice(4, L.length - 4, ['ok', 'hook       exit 0']); }
      return L;
    };
    const run = (e) => {
      timers.forEach(clearTimeout); timers = []; out.textContent = ''; audio.pause();
      const L = plan();
      const k = root.querySelector('input[name=s]:checked').value, mode = val('select').value;
      const speaks = L.some((l) => l[1].startsWith('speak'));
      if (e && e.type === 'click' && speaks && val('[data-snd]').checked) {
        // play inside the click gesture (Safari blocks delayed play); a short lead-in silence keeps it in step with the 'speak' line
        audio.src = `assets/audio/emote-go/${k}-${mode}.mp3`; audio.currentTime = 0;
        audio.play().catch((err) => console.warn('emote-go audio', err));
      }
      const add = (l) => { const sp = document.createElement('span'); sp.className = 'ln ln--' + (l[0] || 'cmd'); sp.textContent = l[1] + '\n'; out.append(sp); };
      L.forEach((l, i) => { if (reduced) add(l); else timers.push(setTimeout(() => add(l), i * 320)); });
    };
    val('[data-run]').addEventListener('click', run, sig);
    root.querySelectorAll('input,select').forEach((n) => n.addEventListener('change', run, sig));
    run();
    return () => { dead.abort(); timers.forEach(clearTimeout); audio.pause(); audio.removeAttribute('src'); };
  } catch (err) { console.warn('emote-go specimen', err); }
}
