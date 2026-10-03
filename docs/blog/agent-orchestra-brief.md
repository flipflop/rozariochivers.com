# Agent Orchestra: factual brief for a blog writer

Source: `/Users/rchivers/Projects/Roz-Agent-Orchestra` (read-only review, 2 Oct 2026). Everything below is from the repo; items marked "(inferred)" are my reading, not stated. Paths are relative to that repo unless absolute.

## 1. What it is

README.md opens: "Agent Orchestra is a local conductor for Claude Code sessions and local Ollama models. One Go binary, `orchestra`, runs" a hook server (127.0.0.1:4791) that Claude Code calls on every tool use "so each call passes a gate chain (policy, proof, classifier, judge, human) before it runs"; a hash-chained Ledger plus per-session journals; the Library (long-term memory as graded markdown facts); the Archive (an organisation's documents); Sight (a code graph and repo map); evals (scheduled quality checks on every AI in the system); and the Stage (127.0.0.1:4790), "a browser UI with an office scene, a ticker and a Needs-you queue for decisions only you can make." Everything binds to 127.0.0.1; "There is no auth and no CORS handling; a hosted version is phase 7."

## 2. Why it exists

`docs/principles.md` (set 25 Sep 2026): it exists "to make our AI use **more effective, more productive, higher quality and more token-efficient**." Three working principles serve that: "**learn from feedback, mistakes and successes**; **ask when unsure**; and **tools before tokens**."

Problems it targets (from principles.md and ADRs):
- Agents act and nothing checks them first or after. ADR 0068: "Our gates act **before** an action. Nothing checked what an agent says **after** it... 'tests pass' in a final report was unchecked prose."
- Token burning: "An LLM reading whole files or directories to find something `grep`, the code graph or a linter would find" is listed as an anti-pattern.
- Agent sprawl: "Spend agents like tokens. At most two agents per task unless Roz raises it... no nested spawning."
- Human attention: aim of "Needs-you items per day (aim <=5 key decisions)".
- Repeat mistakes: "The same correction given twice: the first one was not captured."
- Cheap judges can lie: "Measure before trusting. New judges and suggestions run in shadow mode until their agreement with Roz is measured."

## 3. Architecture

**Single Go binary** (`cmd/orchestra/`, module `github.com/flipflop/orchestra`, Go 1.27.1). Build: `make build` -> `bin/orchestra`. `orchestra up` is the first-run wizard (checks Ollama, rg, z3, Laya venv, hooks, ports; asks 5 questions; writes `~/.orchestra/config.yaml`).

**CLI commands** (from `orchestra --help`, 19 incl. help/completion; `mcp` is also in cmd/ and the README but hidden from the top-level list I saw): 2ic, archive, companions, completion, eval, help, install, judge, ledger, level, library, metronome, play, run, scan, serve, sight, uninstall, up, version, plus `mcp`.
Subcommands (from each `--help`):
- eval: calibrate, check, judge-shadow, labels, list, report, run, seed-history, seed-pending
- library: accept, decline, init, proposals, reindex, rescreen, search, seed-pending, show
- archive: ingest, status
- ledger: query, tail, verify (walks the hash chain, reports first broken link)
- level: get, set, project
- sight: find, graph, index, map, refs
- metronome: next; companions: bench, install, serve, status; scan: check, list, run; judge: fit; 2ic: approval, off, on, status

**Hooks into Claude Code** (`internal/hook/dispatch.go`, `orchestra install` merges HTTP hooks into `~/.claude/settings.json`, backed up first): SessionStart, UserPromptSubmit, PreToolUse, PermissionRequest, PostToolUse, PostToolUseFailure, Stop, SubagentStart, SubagentStop, SessionEnd, Notification (11 events handled). In the user's `~/.claude/settings.json` (general terms only) the same 11 event names are wired, each with an orchestra entry; Stop and Notification also carry a separate voice/emote hook (`emote-go`). SessionStart injects Library facts and a Sight repo map into the session (dispatch.go; tests `library_inject_test.go`, `sight_inject_test.go`).

**Gate chain** (`internal/gates`, README "Gates and autonomy levels"): gate 1 loop guard + agent-spawn rule + OPA rules (`policies/base.rego`, embedded); gate 1b proof (exact procedure over `capabilities.yaml`, cross-checked with z3 if present); gate 2 classifier (Laya sidecar, falling back to Ollama `gemma3:270m`; "allow if all p<0.35, ask if any p>=0.65"); gate 3 local judge (Ollama); gate 4 human approval card with per-level expiry. Read-only tools (Read, Grep, Glob, LS...) skip the chain. "A deny from any gate always ends the chain."

**Autonomy ladder** (`~/.orchestra/policies/autonomy.yaml`, default L3, per-project override via `orchestra level set L3 --project P`): L0 solo (everything asks), L1 duet, L2 sectional, L3 ensemble (default: gates 1-3 may allow; plan approval, DONE and irreversible ops still ask), L4 full orchestra, L5 unattended ("refuses to start without `sandbox: true` and a token budget"). Each change is a Ledger `route` record `decided_by: human`. "Three gate 1/1b/2 denials in one session trip a circuit breaker" that drops the session to L1.

**Agent-spawn cap** (ADR 0047, `internal/gates/agentspawn.go`): `max_agents: 2` default; nested spawn denied always; Sonnet/Haiku allowed within the cap; Opus, omitted or unknown model asks; `opus_allowlist: [Explore, claude-code-guide, statusline-setup]`. Loop guard: `repeat_threshold: 3` in `repeat_window_minutes: 10`, `tool_call_cap: 1000`.

**MCP server** (`orchestra mcp`, stdio, `internal/mcp`, `internal/kanbanmcp`): tools visible in this environment as `mcp__orchestra__*`: archive_cite, archive_open, archive_search, find, impact, kanban_get, kanban_list, kanban_update, library_get, library_propose, library_recall, library_search, outline, repo_map, symbol_refs (15). The `mcp --help` text itself says "(library_*, archive_* tools)"; the Sight and kanban tools are newer (inferred from commit history, not checked per commit).

**Library / Archive / memory** (README Reference): Library = markdown facts with frontmatter, git-committed, `index.db` derived, `MEMORY.md` generated, fact lifecycle (30 d unused -> stale, +30 d -> archived, pinned exempt; ADR 0025), single writer (ADR 0009), proposals accepted/declined/edited by the human, produced by Rehearsal reflection. Archive = documents converted via Docling companion, chunked, indexed, facts extracted (ADR 0012-0014). `you.md` carries per-line provenance.

**Sight** (`internal/sight`): tree-sitter tagger with regex fallback (ADR 0020), code graph, ranked token-budgeted repo map (ADR 0021), optional rerank (ADR 0033, off by default: "no recall gain, ~1 s", HANDOVER).

**Metronome** (`internal/metronome`, ADR 0018): the "op: auto next-step router". **2IC** (second-in-command, ADR 0038): a Director-model decision layer; "Director runs with **no tools or MCP** (lethal trifecta)" (HANDOVER).

**Kanban**: `Kanban-Go/` is a standalone module (own go.mod, MIT licence) - "plain files instead of a database": a board is a directory with `board.yaml`, `history.ndjson` (append-only), and `cards/*.md` (YAML front matter + markdown). JSON API, vanilla-JS UI, KPI engine, terminal UI (Bubble Tea, `kanban-tui`), CLI and slim MCP. Orchestra embeds it as the Board tab (ADR 0055); ADR 0056: subagent spawns get a card filed automatically by hooks, moved to Review on clean finish or blocked with a reason.

**Evals & scores**: 11 suites in `evals/suites/` (classifier-risk, denial-learning, gate-judge, injection-guard, library-reflection, metronome-dedup, metronome-target, needs-you-triage, player-coding, repo-map-retrieval, twoic-escalation), embedded via `evalsfs.go`. Each run records backend, model, model digest, prompt version, binary version; pass rate with Wilson 95% CI, pass@k, pass^k. Regression rule: pooled last 14 comparable runs; "regressed" when CI upper bound < baseline lower bound. Schedule: regression suites nightly 02:30, capability suites Sundays 03:00, plus on model/prompt/binary change. Results in `~/.orchestra/evals/evals.db` (SQLite, append-only). Also: judge-alignment report (balanced accuracy, Cohen's kappa vs Roz), judge-shadow with bootstrap CIs, frozen held-out label sets (`evals/labels/FROZEN.sha256`), human label queue. "Scores" (`scores/examples/feature.yaml`, `hello.yaml`) are YAML plans run by `orchestra play`, movement by movement (music metaphor throughout: players, movements, Stage, Metronome).

**Web UI (the Stage)**: vanilla JS, no build step, embedded via `webfs.go`; `http://127.0.0.1:4790` (`?demo=1` canned data). Office scene (a character per live session moving between zones), ticker, Needs-you/Inbox, level control, tabs (Sessions, Ledger, Evals, FSM, Library, Archive, Codebase, Reporting, Board, ...). New UI behind `?ui=next` with a design system (`web/ds`, ADR 0058).

**`deploy/`** exists but is empty (verified `ls`). `companions/laya/` holds the embedded Python classifier sidecar (`server.py`); Docling is the other companion.

## 4. Design principles and decisions

- **CLI-first, one binary, embedded assets** - Stage (`webfs.go`) and eval suites (`evalsfs.go`) are in the binary: "rebuild before restarting whenever `web/` or `evals/` changes." Kanban-Go: "CLI-first + slim MCP" (HANDOVER).
- **Local-first / privacy**: binds 127.0.0.1 only; the judge "must run locally: `:cloud` and other remote Ollama models are never offered, and typing one is refused."
- **Governance with a paper trail**: Ledger is hash-chained NDJSON (ADR 0004); "never rotated, compressed or pruned in either mode, because that would break the hash chain."
- **Cheapest good-enough tier first**: "Code checks before a local model, a local model before the Director, the Director before Roz."
- **Formal methods**: the Task state machine is specified in TLA+ (`docs/tla/Task.tla`) and a Go test cross-checks it; invariant: "the actor that fired `implement` cannot fire `verify`." `make tla` runs TLC if installed.
- **Measure before trusting**: shadow modes, frozen thresholds, "oracle/no-op checks" on eval tasks. A recorded decision, K1: fitted cascade thresholds "**not** applied, because the fit scored AUROC 0.44."
- **Decisions recorded**: 69 ADRs in `docs/adr/` plus research notes (14 in `docs/research/`), contracts, glossary, a trials register.
- **Safe testing**: tests and smoke runs use a temp `--home` and 4799x ports, "never the live 4790/4791/5011."
- Authoring workflow (HANDOVER "Working rules"): a Director model writes contracts, Sonnet/Haiku agents build, max 2 at once, enforced by the spawn rule itself.

## 5. Timeline (git)

- First commit: **2026-09-23**. Commit count: **305** (`git rev-list --count HEAD`). Latest in my read: 2026-10-01. So about nine days.
- Commits per day (from `git log`): 23 Sep 20, 24 Sep 89, 25 Sep 64, 26 Sep 32, 27 Sep 47, 28 Sep 31, 29 Sep 8, 30 Sep 4, 1 Oct 10.
- Phases (HANDOVER, ADR titles): phases 1-5 built by 24 Sep (hooks, ledger, gates, library, archive, Sight, evals, you.md); 24 Sep: evals, `orchestra up`, Needs-you redesign, "Jev improvements" J1-J10; 25 Sep: 2IC, telemetry, denial learning, voice; 26 Sep: spawn rule (ADR 0047), projects; 27-28 Sep: Stage redesign P0-P5 (smoke harness, design system, new shell, Home, Inbox, Agents/Tests views), Kanban-Go terminal UI, logit judge; 29 Sep-1 Oct: per-project autonomy (ADR 0064), decision-context cards, P6 rules editor, judge-shadow CIs, frozen label sets, "prove-it" check (ADR 0068). Phase 7 (hosted) is parked; P7 = make `?ui=next` the default.

## 6. Numbers I counted

- 305 commits: `git rev-list --count HEAD`.
- 19 top-level CLI commands listed in `orchestra --help` (counted by eye, includes help and completion), plus hidden/unlisted `mcp`.
- 11 hook events dispatched: `switch req.HookEventName` cases in `internal/hook/dispatch.go`.
- 43 packages under `internal/`: `ls internal | wc -l`. 53 Go packages repo-wide: `go list ./... | wc -l` (includes Kanban-Go? (inferred: includes cmd and root)).
- 379 non-test and 239 test Go files, excluding `Reference/` and `third_party/`: `find ... | wc -l`.
- 11 eval suites (`ls evals/suites`); 204 task id lines in `evals/suites/*/tasks/*.yaml` (grep count, approximate; needs-you-triage has no tasks dir). HANDOVER on 24 Sep said "5 suites / 86 tasks".
- 69 ADRs: `ls docs/adr | grep -c '^0'`. 14 files in `docs/research`.
- 15 MCP tools visible in this session as `mcp__orchestra__*`.
- 6 autonomy levels (L0-L5); 7 gates/gate stages in the table (1 loop guard, 1 agent-spawn, 1 rules, 1b, 2, 3, 4).
- 23 entries in `web/components`.
- Ports: 4790 API/Stage, 4791 hooks, 5011 Laya, 4792 OTLP (HANDOVER).
- Latest HANDOVER claims: smoke 96/96, contract 17/17 checks green (27-28 Sep, not re-run by me). README is 757 lines.

## 7. Work in progress or rough (honest list)

- Phase 7 (hosted) not built; today no auth, no CORS; "`decided_by: human` can be claimed by any API caller; a Stage credential is a P7 precondition" (HANDOVER).
- Stage redesign: new UI is opt-in (`?ui=next`); the classic canvas tabs still need restyling; P7 wants two weeks on classic, then remove the old UI.
- Known bugs/backlog (HANDOVER 29 Sep): a stopped subagent never sends SubagentStop so its slot stays in the spawn cap until a 2 h TTL; `make contract` flaked once.
- Many features ship in shadow or off: reranking off by default; eval pre-grader off ("Laya disagreed with the judge"); triage suggestions in shadow ("raw agreement 75% hid that it got only 14 of 56 accepts right"); prove-it is advisory with `enforce_done` default off; Agent Quality Score weight 0 during shadow week.
- Laya is "a weak zero-shot judge and uncalibrated (ECE 0.155)"; the Jeff and Nimble model trials were rejected or on hold (`docs/trials`).
- Telegram approvals, tool allowlists per agent type, `orchestra tui`, rollback and stop-agent are backlog items. Kanban-Go project-management layer is a plan (on hold in places).
- Companions need ~1.4 GB Laya venv; Python sidecar so not pure Go. `deploy/` is empty. The README still says "hosted version is phase 7".
- README is still being kept in step with fast commits (inferred: commit cadence of ~30-90/day early on).

## 8. Vivid examples (real text)

**a) A deny with a "Do instead"** (`internal/denials/denials.go`, ADR 0041). When an agent writes outside the project, the deny reason built by `Explain` reads: "Agent Orchestra denied this call (rule deny-write-outside-scope): ... Blocked: Write to ~/x is outside this project. Allowed write scope: <root>/... (the project root), plus ~/.orchestra and the temp dir. Do instead: write under <root>/...; put scratch files in $TMPDIR/...; if a file outside the project really must change, stop and ask Roz. Do not retry the same path or route it through Bash, another tool or a subagent." (sentences assembled from the source's format strings; the path is a placeholder). Other rules: `deny-rm-rf-root` -> "delete specific paths inside <root>/..., or ask Roz."; `deny-force-push-protected-branch` -> "push a feature branch and open a pull request, or ask Roz." Non-scope denials end "Retrying the same call will be denied again." An eval suite (`denial-learning`) tests that deny reasons name what was blocked, the root and the alternative.

**b) The spawn cap in action** (`internal/gates/agentspawn.go`): "this session already has 2 of 2 agents running; wait for one to finish, or raise max_agents in autonomy.yaml" and "this call is already running inside a subagent; do the work yourself instead of spawning another agent (nested spawning is never allowed)". Principles.md records its first live day: a false "6 of 2 agents" denial, fixed by ignoring inferred registry rows (ADR 0047 amendment). The rule governs the very agents that built the project.

**c) Kanban flow** (`docs/agent-kanban.md`, ADR 0056): a subagent's card is filed automatically when its spawn is allowed, moved to Review when it finishes cleanly, or blocked with a reason. An agent can run `kanban card comment --dir ~/.orchestra/kanban --id <id> --text "..."` or `kanban card block ... --reason "..."`; with no shell, the same via `kanban_list`/`kanban_update` MCP tools. Cards are markdown files; history is append-only NDJSON.

**d) Prove-it** (ADR 0068): compares a claim of "done" with the Ledger's record of allowed edits, test runs and git commits, not "asking the agent for more claims". Tests must run after the last source edit "else the evidence is `stale`"; "The 2IC can never waive a **contradicted** claim; a human can."

**e) Eval honesty anecdote** (`docs/principles.md`): "K1: fitted cascade thresholds **not** applied, because the fit scored AUROC 0.44 and would have sent every 2IC item to the Director." And: "A sweeping `git commit -a` picked up Roz's raw art; the fix (stage files by name) is now a recorded lesson."

## 9. Licence and visibility

- No top-level LICENSE file in the repo root (checked with `find`). `Kanban-Go/LICENSE` is MIT, "Copyright (c) 2026 Rozario Chivers". `Reference/` and `third_party/` hold others' code under their own licences.
- Visibility: not stated in README. HANDOVER says pushed to `github.com/flipflop/roz-agent-orchestra` (flipflop = Roz's personal GitHub, where repos are private per global notes; so likely private, inferred). Go module path `github.com/flipflop/orchestra`. Treat as unreleased/personal; confirm with Roz before publishing details.
