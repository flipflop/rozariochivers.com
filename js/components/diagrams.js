/**
 * diagrams.js — editorial architecture diagrams (inline SVG strings), drawn in the almanac print style.
 *   orchestraArchitecture()   Agent Orchestra, high level: Claude Code → hooks → gate chain → decision,
 *                             with the Ledger, memory and the Stage. Source: Roz-Agent-Orchestra README
 *                             ("Code layout", "Gates and autonomy levels", "The players").
 */

export function orchestraArchitecture() {
  const box = (x, y, w, h, t, s, cls = 'b') => `<g><rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}"/>
    <text class="${cls === 'ink' ? 't on-ink' : 't'}" x="${x + 12}" y="${y + 24}">${t}</text>${s ? `<text class="${cls === 'ink' ? 's on-ink-s' : 's'}" x="${x + 12}" y="${y + 42}">${s}</text>` : ''}</g>`;
  const cell = (x, n, t, s, hot) => `<g><rect class="${hot ? 'cell hot' : 'cell'}" x="${x}" y="186" width="66" height="62"/>
    <text class="${hot ? 'n on-ink-s' : 'n'}" x="${x + 8}" y="204">${n}</text><text class="${hot ? 'ct on-ink' : 'ct'}" x="${x + 8}" y="224">${t}</text><text class="${hot ? 'cs on-ink-s' : 'cs'}" x="${x + 8}" y="239">${s}</text></g>`;
  const chev = (x) => `<path class="chev" d="M${x} 210 L${x + 5} 217 L${x} 224"/>`;
  return `<svg viewBox="0 0 800 520" role="img" aria-labelledby="orch-t orch-d">
  <title id="orch-t">Agent Orchestra architecture</title>
  <desc id="orch-d">Claude Code sends every tool call to the Orchestra hook server. The call passes a gate chain, cheapest check first: rules, proof, classifier, local judge and finally a human. The decision (allow, ask or deny) returns to Claude Code, every decision is written to the hash-chained Ledger, and items that need a person go to the Needs-you queue in the Stage. Local models (Ollama and Laya) run the classifier and judge on the same machine. An MCP server gives Claude Code tools for the Library, Archive, code graph and kanban board.</desc>
  <defs>
    <pattern id="orch-ht" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="2.5" cy="2.5" r="1" fill="var(--blue-deep,#4F8DB3)" opacity=".45"/></pattern>
    <marker id="orch-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10Z" fill="var(--ink,#161616)"/></marker>
    <marker id="orch-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10Z" fill="var(--red,#C8452E)"/></marker>
    <style>
      .frame{fill:var(--paper-2,#E8E1CF);stroke:var(--ink,#161616);stroke-width:2.5}
      .shadow{fill:var(--blue,#7DB6D8)}
      .b{fill:var(--paper,#F1ECDF);stroke:var(--ink,#161616);stroke-width:2}
      .ext{fill:var(--paper,#F1ECDF);stroke:var(--ink,#161616);stroke-width:2;stroke-dasharray:6 4}
      .ink{fill:var(--ink,#161616);stroke:var(--ink,#161616);stroke-width:2}
      .cell{fill:var(--paper,#F1ECDF);stroke:var(--ink,#161616);stroke-width:1.5}
      .cell.hot{fill:var(--ink,#161616)}
      .t{font:500 13px var(--f-cond,'Oswald',sans-serif);letter-spacing:.12em;text-transform:uppercase;fill:var(--ink,#161616)}
      .s{font:400 11px var(--f-mono,monospace);fill:var(--ink-3,#5E5A50)}
      .n{font:500 10px var(--f-mono,monospace);fill:var(--ink-3,#5E5A50)}
      .ct{font:500 11px var(--f-cond,'Oswald',sans-serif);letter-spacing:.08em;text-transform:uppercase;fill:var(--ink,#161616)}
      .cs{font:400 9.5px var(--f-mono,monospace);fill:var(--ink-3,#5E5A50)}
      .on-ink{fill:var(--paper,#F1ECDF)}
      .on-ink-s{fill:var(--blue,#7DB6D8)}
      .flow{fill:none;stroke:var(--ink,#161616);stroke-width:2;stroke-linejoin:round;marker-end:url(#orch-a)}
      .flow.red{stroke:var(--red,#C8452E);marker-end:url(#orch-ar)}
      .flow.dash{stroke-dasharray:5 4}
      .chev{fill:none;stroke:var(--ink,#161616);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
      .lbl{font:500 10px var(--f-mono,monospace);letter-spacing:.06em;fill:var(--ink,#161616)}
      .lbl.red{fill:var(--red,#C8452E)}
      .cap{font:500 11px var(--f-cond,'Oswald',sans-serif);letter-spacing:.2em;text-transform:uppercase;fill:var(--ink,#161616)}
    </style>
  </defs>

  <!-- the binary: mis-registered blue under-print, then the frame -->
  <rect class="shadow" x="230" y="64" width="420" height="440"/>
  <rect class="frame" x="222" y="56" width="420" height="440"/>
  <text class="cap" x="238" y="484">Orchestra · one Go binary · 127.0.0.1 only</text>

  <!-- outside the binary -->
  ${box(20, 86, 150, 64, 'Claude Code', 'session · tool calls', 'ink')}
  ${box(20, 380, 150, 72, 'You', 'the Stage :4790', 'b')}
  <text class="s" x="32" y="440">Needs-you queue</text>
  ${box(668, 172, 126, 90, 'Local models', 'Ollama · Laya', 'ext')}
  <text class="s" x="680" y="236">on this Mac,</text><text class="s" x="680" y="250">never the cloud</text>

  <!-- inside the binary -->
  ${box(244, 86, 176, 56, 'Hook server :4791', '11 hook events')}
  ${box(444, 86, 176, 56, 'MCP server', '15 tools')}
  <rect class="b" x="244" y="160" width="376" height="104"/>
  <text class="t" x="256" y="178" style="font-size:11px">Gate chain · cheapest check first</text>
  ${cell(254, '1', 'Rules', 'OPA policy')}${chev(323)}
  ${cell(328, '1b', 'Proof', 'z3 solver')}${chev(397)}
  ${cell(402, '2', 'Classify', 'Laya')}${chev(471)}
  ${cell(476, '3', 'Judge', 'Ollama')}${chev(545)}
  ${cell(550, '4', 'Human', 'approval', true)}
  ${box(244, 308, 118, 64, 'Ledger', 'hash-chained')}
  ${box(373, 308, 118, 64, 'Library', 'memory')}
  ${box(502, 308, 118, 64, 'Archive', 'org documents')}
  ${box(244, 388, 118, 64, 'Sight', 'code graph')}
  ${box(373, 388, 118, 64, 'Evals', '11 suites')}
  ${box(502, 388, 118, 64, 'Board', 'kanban cards')}

  <!-- flows: arrive square-on, short straight final runs -->
  <path class="flow" d="M170 114 L236 114"/>
  <text class="lbl" x="176" y="92">every</text><text class="lbl" x="176" y="105">tool call</text>

  <path class="flow" d="M332 142 L332 152"/>

  <path class="flow red" d="M244 230 L110 230 Q96 230 96 216 L96 158"/>
  <text class="lbl red" x="104" y="206">allow ·</text><text class="lbl red" x="104" y="219">ask · deny</text>

  <path class="flow" d="M244 256 L126 256 Q112 256 112 270 L112 372"/>
  <text class="lbl" x="118" y="292">needs a person</text>

  <path class="flow" d="M303 264 L303 300"/>
  <text class="lbl" x="310" y="288">every decision</text>

  <path class="flow dash" d="M620 214 L660 214"/>
  <text class="lbl" x="624" y="206">score</text>

  <path class="flow dash" d="M532 86 L532 40 Q532 26 518 26 L110 26 Q96 26 96 40 L96 78"/>
  <text class="lbl" x="250" y="18">MCP tools: library · archive · sight · kanban</text>
</svg>`;
}

/** Mould Detect "how it works": one photo → four readings → four paths. Drawn for the dark command band
 *  (reads band locals: --on-band, --on-band-2, --band, --blue, --red). Content from molddetect.app. */
export function mouldFlow({ readings, paths }) {
  const ys = [66, 146, 226, 306];
  const rd = readings.map((r, i) => `<rect class="mf-rd" x="262" y="${ys[i] - 26}" width="200" height="52"/><text class="mf-rt" x="362" y="${ys[i] + 5}">${r}</text><path class="mf-bus" d="M462 ${ys[i]} L492 ${ys[i]}"/>`).join('');
  const pt = paths.map((p, i) => `<path class="mf-fan" d="M532 186 C578 186 572 ${ys[i]} 610 ${ys[i]}"/><rect class="mf-pt" x="620" y="${ys[i] - 26}" width="320" height="52"/><text class="mf-pl" x="780" y="${ys[i] + 5}">${p.t}</text>`).join('');
  const soon = paths.findIndex((p) => p.soon);
  const stamp = soon < 0 ? '' : `<g transform="translate(900 ${ys[soon] - 32}) rotate(-6)"><rect class="mf-st" x="-58" y="-13" width="116" height="26"/><text class="mf-stt" x="0" y="5">COMING SOON</text></g>`;
  return `<svg viewBox="0 0 960 372" role="img" aria-labelledby="mf-t mf-d">
  <title id="mf-t">How Mould Detect works</title>
  <desc id="mf-d">One photo from a phone becomes four readings in under sixty seconds: ${readings.join(', ')}. Each reading opens a path: ${paths.map((p) => p.t + (p.soon ? ' (coming soon)' : '')).join(', ')}.</desc>
  <defs>
    <marker id="mf-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10Z" fill="var(--blue,#7DB6D8)"/></marker>
    <style>
      .mf-ph{fill:none;stroke:var(--on-band,#F1ECDF);stroke-width:2.5}
      .mf-scr{fill:var(--on-band,#F1ECDF);opacity:.08}
      .mf-ring{fill:none;stroke:var(--blue,#7DB6D8);stroke-width:3}
      .mf-dot{fill:var(--blue,#7DB6D8)}
      .mf-arrow{fill:none;stroke:var(--blue,#7DB6D8);stroke-width:2.5;marker-end:url(#mf-a)}
      .mf-rd{fill:var(--blue,#7DB6D8);stroke:none}
      .mf-rt{font:500 14px var(--f-cond,'Oswald',sans-serif);letter-spacing:.12em;text-transform:uppercase;fill:var(--band,#161616);text-anchor:middle}
      .mf-bus{fill:none;stroke:var(--blue,#7DB6D8);stroke-width:2}
      .mf-fan{fill:none;stroke:var(--blue,#7DB6D8);stroke-width:2;marker-end:url(#mf-a)}
      .mf-pt{fill:none;stroke:var(--on-band,#F1ECDF);stroke-width:1.5}
      .mf-pl{font:400 17px var(--f-display,'Marcellus',serif);fill:var(--on-band,#F1ECDF);text-anchor:middle}
      .mf-lbl{font:500 11px var(--f-mono,monospace);letter-spacing:.14em;fill:var(--on-band-2,#BDB6A6)}
      .mf-st{fill:var(--red,#C8452E)}
      .mf-stt{font:500 11px var(--f-cond,'Oswald',sans-serif);letter-spacing:.24em;fill:var(--on-band,#F1ECDF);text-anchor:middle}
    </style>
  </defs>
  <rect class="mf-ph" x="44" y="100" width="92" height="172" rx="14"/>
  <rect class="mf-scr" x="56" y="116" width="68" height="124" rx="4"/>
  <circle class="mf-ring" cx="90" cy="176" r="17"/><circle class="mf-dot" cx="90" cy="176" r="5"/>
  <circle class="mf-ph" cx="90" cy="256" r="6" style="stroke-width:2"/>
  <text class="mf-lbl" x="90" y="300" text-anchor="middle">1 PHOTO</text>
  <path class="mf-arrow" d="M152 186 L252 186"/>
  <text class="mf-lbl" x="202" y="174" text-anchor="middle">&lt; 60 SEC</text>
  ${rd}
  <path class="mf-bus" d="M492 66 L492 306 M492 186 L532 186"/>
  ${pt}
  ${stamp}
</svg>`;
}
