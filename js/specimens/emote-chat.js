/** Specimen: emote-chat — a scripted push-to-talk walkthrough of the local voice pipeline. */
import { frag, esc } from './_util.js';

const SAY = [
  { text: 'I finally got the build to pass!', emotion: 'happy', reply: 'That is great news. Well done for sticking with it.', voice: 'happy' },
  { text: 'Wait, it deleted the whole folder?', emotion: 'surprised', reply: 'Oh no. Let us check the backups first, calmly.', voice: 'calm' },
  { text: 'This is the third time it has broken.', emotion: 'negative', reply: 'That sounds frustrating. Shall we find what keeps breaking it?', voice: 'sad' },
  { text: 'What time does the meeting start?', emotion: 'neutral', reply: 'I do not have your calendar, but I can help you write the reminder.', voice: 'neutral' }
];
const STAGES = [
  ['Moonshine Tiny (WASM)', 'speech to text, in the page'],
  ['emotion2vec', 'emotion from the raw audio, on CPU'],
  ['Local Ollama model', 'reply plus the emotion to speak with'],
  ['pocket-tts', 'streamed audio']
];

export function mount(el, project, { reduced = false } = {}) {
  try {
    const root = frag(`<div class="sp-chat">
      <ol class="sp-chat__pipe" aria-label="Pipeline">${STAGES.map(([a, b], i) => `<li data-i="${i}"><b class="caps">${i + 1} · ${esc(a)}</b><span>${esc(b)}</span></li>`).join('')}</ol>
      <div class="sp-chat__log" role="log" aria-live="polite"><p class="sp-chat__empty mono">Pick something to say, then hold the talk button. Detection runs when you let go.</p></div>
      <div class="sp-chat__say" role="radiogroup" aria-label="What you say">${SAY.map((s, i) => `<label><input type="radio" name="say" value="${i}" ${i ? '' : 'checked'}><span>“${esc(s.text)}”</span></label>`).join('')}</div>
      <div class="sp-chat__bar"><button class="btn sp-chat__talk" type="button" aria-label="Hold to talk (or press Space or Enter)">Hold to talk</button><span class="mono sp-chat__state" aria-live="polite">idle · all local</span></div>
      <p class="sp-note">Scripted illustration: nothing is recorded, no model runs and no audio plays. It follows the pipeline in the emote-chat README: in-browser speech to text, a four-label emotion classifier (happy, surprised, negative, neutral), a local chat model, then streamed speech.</p>
    </div>`);
    el.replaceChildren(root);
    const dead = new AbortController(), sig = { signal: dead.signal };
    const log = root.querySelector('.sp-chat__log'), st = root.querySelector('.sp-chat__state'), btn = root.querySelector('.sp-chat__talk');
    const steps = [...root.querySelectorAll('.sp-chat__pipe li')];
    let timers = [], held = false, busy = false;
    const lit = (n) => steps.forEach((s, i) => { s.classList.toggle('is-on', i === n); s.classList.toggle('is-done', i < n); });
    const bubble = (cls, html) => { const d = document.createElement('div'); d.className = 'sp-chat__b ' + cls; d.innerHTML = html; log.append(d); log.scrollTop = log.scrollHeight; return d; };
    const later = (f, ms) => { if (reduced) f(); else timers.push(setTimeout(f, ms)); };
    const start = () => { if (busy || held) return; held = true; btn.classList.add('is-held'); st.textContent = 'listening…'; lit(0); log.querySelector('.sp-chat__empty')?.remove(); };
    const stop = () => {
      if (!held) return; held = false; busy = true; btn.classList.remove('is-held');
      const s = SAY[+root.querySelector('input[name=say]:checked').value];
      st.textContent = 'working…'; lit(0);
      later(() => { bubble('is-you', `${esc(s.text)}<small class="mono">STT · in the browser</small>`); lit(1); }, 350);
      later(() => { bubble('is-tag', `<span class="caps">Heard as</span> <b class="mono">${s.emotion}</b>`); lit(2); }, 900);
      later(() => { bubble('is-bot', `${esc(s.reply)}<small class="mono">voice emotion: ${s.voice}</small>`); lit(3); }, 1500);
      later(() => { lit(4); st.textContent = 'idle · all local'; busy = false; }, 2200);
    };
    btn.addEventListener('pointerdown', (e) => { e.preventDefault(); start(); }, sig);
    window.addEventListener('pointerup', stop, sig);
    btn.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) start(); } }, sig);
    btn.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') stop(); }, sig);
    btn.addEventListener('blur', stop, sig);
    return () => { dead.abort(); timers.forEach(clearTimeout); };
  } catch (err) { console.warn('emote-chat specimen', err); }
}
