/** Specimen: emote-cli — pipe text in, get a verdict: a toy lexicon classifier, five modes, and emoji read by name. */
import { frag, esc } from './_util.js';

const MODES = ['verbose', 'summarised', 'important', 'warnings', 'code'];
const POS = /\b(pass(ed|es)?|success|done|ready|great|green|fixed|works?|complete)\b/i;
const NEG = /\b(fail(ed|s|ure)?|error|traceback|exception|broken|crash(ed)?|denied)\b/i;
const EXC = /!|\b(wow|amazing|shipped|released)\b/i;
const EMOJI = { '🎉': 'party popper', '✅': 'check mark button', '❌': 'cross mark', '🔥': 'fire', '👍': 'thumbs up', '🚀': 'rocket' };
const classify = (t) => NEG.test(t) ? 'sad' : EXC.test(t) && POS.test(t) ? 'excited' : POS.test(t) ? 'happy' : /\b(because|so|then|means|explain|reads?)\b/i.test(t) ? 'calm' : 'neutral';
const PRESETS = [
  ['pytest 2>&1 | emote', '42 passed in 3.1s. All checks are green ✅'],
  ['pytest 2>&1 | emote', 'Traceback (most recent call last): KeyError: ‘id’ ❌'],
  ['echo … | emote', 'It reads the last message, then picks what is worth saying.'],
  ['echo … | emote', 'Shipped the release! 🎉']
];

function speak(text, mode) {
  let t = text.replace(/\p{Extended_Pictographic}️?/gu, (m) => EMOJI[m] || EMOJI[m.replace('️', '')] || 'emoji');
  if (mode === 'summarised') t = t.split(/(?<=[.!?])\s+/)[0];
  if (mode === 'important' && !/\d|fail|error|traceback|warning/i.test(t)) t = '(nothing marked important)';
  if (mode === 'warnings') t = NEG.test(t) || /warning/i.test(t) ? t : '(no warnings, stays silent)';
  if (mode === 'code') t = t.replace(/[()[\]{}<>_=.:]/g, (c) => ` ${{ '(': 'open paren', ')': 'close paren', '[': 'open bracket', ']': 'close bracket', '{': 'open brace', '}': 'close brace', '<': 'less than', '>': 'greater than', _: 'underscore', '=': 'equals', '.': 'dot', ':': 'colon' }[c]} `).replace(/\s+/g, ' ').trim();
  return t;
}

export function mount(el, project, { reduced = false } = {}) {
  try {
    const root = frag(`<div class="sp-term sp-cli">
      <div class="sp-term__ctl">
        <fieldset><legend class="caps">Pipe this in</legend><div class="sp-cli__chips">${PRESETS.map((p, i) => `<button class="sp-chip" type="button" data-p="${i}">${esc(p[1].slice(0, 26))}…</button>`).join('')}</div></fieldset>
        <fieldset><legend class="caps">EMOTE_MODE</legend><select aria-label="EMOTE_MODE">${MODES.map((m) => `<option ${m === 'summarised' ? 'selected' : ''}>${m}</option>`).join('')}</select></fieldset>
      </div>
      <form class="sp-cli__form"><span class="mono" aria-hidden="true">$ echo</span><input type="text" aria-label="Text to pipe into emote" value="${esc(PRESETS[0][1])}" spellcheck="false"><span class="mono" aria-hidden="true">| emote</span></form>
      <pre class="sp-term__out" tabindex="0" aria-live="polite" aria-label="emote output"></pre>
      <p class="sp-note sp-note--band">Illustration: a toy classifier written for this page, not the real deterministic lexicon, and no audio is played. It mimics what the README describes: five modes, five emotions (happy, sad, excited, calm, neutral), code read with symbols spoken, and emoji read by their Unicode names.</p>
    </div>`);
    el.replaceChildren(root);
    const dead = new AbortController(), sig = { signal: dead.signal };
    const inp = root.querySelector('input[type=text]'), mode = root.querySelector('select'), out = root.querySelector('.sp-term__out');
    const run = () => {
      const text = inp.value.trim(), m = mode.value;
      const L = [['cmd', `$ echo "${text}" | EMOTE_MODE=${m} emote`], ['ok', `emotion   ${classify(text)}`], ['', `speaking  "${speak(text, m)}"`], ['ok', 'exit 0']];
      out.textContent = '';
      L.forEach((l) => { const s = document.createElement('span'); s.className = 'ln ln--' + (l[0] || 'cmd'); s.textContent = l[1] + '\n'; out.append(s); });
    };
    root.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); run(); }, sig);
    inp.addEventListener('input', run, sig); mode.addEventListener('change', run, sig);
    root.querySelectorAll('[data-p]').forEach((b) => b.addEventListener('click', () => { inp.value = PRESETS[+b.dataset.p][1]; run(); }, sig));
    run();
    return () => { dead.abort(); };
  } catch (err) { console.warn('emote-cli specimen', err); }
}
