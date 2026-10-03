/* Draft copy for POSTS[agent-orchestra] — authored by the director in Roz's voice; merged into js/data/posts.js. */
export const AGENT_ORCHESTRA = {
  slug: 'agent-orchestra',
  title: 'Agent Orchestra: conducting a fleet of coding agents from the command line',
  dek: 'A work-in-progress, CLI-first conductor for Claude Code and local models: gates before every action, proof after every claim, and a paper trail for both.',
  summary: 'Agent Orchestra is a single Go binary that sits between Claude Code and the work. Every tool call passes a chain of gates (policy, proof, classifier, local judge, human) before it runs, every claim of “done” is checked against the record afterwards, and every decision lands in a hash-chained ledger. Nine days, 305 commits and 69 architecture decisions in, this dispatch covers why it exists, how it is put together and the rules I now apply to any agentic workflow.',
  date: '2026-10-02',
  readMins: 9,
  tags: ['Agentic engineering', 'Claude Code', 'Go', 'Governance', 'Evals'],
  status: 'Work in progress',
  hero: 'orchestra',
  facts: [
    ['Form', 'One Go binary, CLI first, browser Stage embedded'],
    ['Hooks', '11 Claude Code hook events'],
    ['MCP tools', '15 (library, archive, code graph, kanban)'],
    ['Evals', '11 suites, scheduled nightly and weekly'],
    ['Decisions', '69 ADRs, a TLA+ spec for the task state machine'],
    ['History', 'First commit 23 Sep 2026; 305 commits in nine days'],
    ['Status', 'Local only, personal project, phase 7 (hosted) parked']
  ],
  body: [
    {
      h: 'Introduction',
      p: [
        'This dispatch describes Agent Orchestra, a local conductor for Claude Code sessions and local Ollama models. It is a work in progress, written mostly by the agents it governs, and it is already the way I work every day.',
        'Coding agents are now very good at doing things. They are considerably less good at knowing when they should not, and at telling you honestly what they actually did. “Tests pass” in a final report is, until someone checks, unchecked prose. Agent Orchestra is my attempt to put a conductor in front of the orchestra: something that reads every call before it is played, and checks the recording afterwards.'
      ]
    },
    {
      h: 'Purpose of this project',
      p: [
        'The project principles state the purpose plainly: to make our AI use more effective, more productive, higher quality and more token-efficient. Three working principles serve that purpose:'
      ]
    },
    {
      list: [
        'Learn from feedback, mistakes and successes. The same correction given twice means the first one was not captured.',
        'Ask when unsure. Human attention is the scarcest resource in the system, so the aim is five key decisions a day, not fifty interruptions.',
        'Tools before tokens. An LLM reading whole directories to find something grep, a code graph or a linter would find is an anti-pattern.'
      ],
      ordered: true
    },
    {
      note: 'Anthropic’s own guidance on building agents makes the same point from the other direction: start with the simplest pattern that works, and only add autonomy where it earns its keep (https://www.anthropic.com/research/building-effective-agents). Orchestra treats autonomy as something granted, measured and revocable.'
    },
    {
      h: 'Overview',
      p: [
        'One binary, orchestra, runs the following on 127.0.0.1 only:'
      ]
    },
    {
      list: [
        'A hook server that Claude Code calls on every tool use, so each call passes a gate chain before it runs.',
        'The Ledger: a hash-chained, append-only record of every decision, plus per-session journals.',
        'The Library: long-term memory as graded markdown facts, proposed by the agents and accepted or declined by a human.',
        'The Archive: an organisation’s documents, converted, chunked and indexed for citation.',
        'Sight: a code graph and ranked, token-budgeted repo map, injected at session start.',
        'Evals: scheduled quality checks on every AI in the system, including the judges.',
        'The Stage: a browser UI with an office scene, a ticker and a “Needs you” queue for the decisions only a human can make.'
      ]
    },
    {
      h: 'The gate chain',
      p: [
        'Every non-read-only tool call walks a chain, cheapest check first: a loop guard, the agent-spawn rule and policy rules (Open Policy Agent); a proof step over declared capabilities, cross-checked with the z3 solver where present; a small classifier; a local judge model; and finally a human approval card. Read-only tools such as Read and Grep skip the chain entirely. A deny from any gate always ends the chain.',
        'The ordering is the point. Code checks before a local model, a local model before the Director model, the Director before me. Each tier is only consulted when the cheaper one is unsure.'
      ]
    },
    {
      note: 'The local judge must run locally. Remote and :cloud models are never offered, and typing one in is refused. Governance that ships your code to a third party to decide whether it is safe is not governance.'
    },
    {
      h: 'Denials that teach',
      p: [
        'A bare “permission denied” teaches an agent nothing, and it will usually try the same thing again by another route. Every Orchestra denial therefore names the rule, what was blocked, and what to do instead. For example, a write outside the project root is refused with the allowed scope, a suggestion to use the project or the temp directory, and an instruction not to route the same write through Bash, another tool or a subagent. A forced push to a protected branch is refused with “push a feature branch and open a pull request, or ask Roz.”',
        'There is an eval suite for this (denial-learning) which checks that every deny reason names what was blocked, the root and the alternative. Denials are part of the interface, so they are tested like one.'
      ]
    },
    {
      h: 'Autonomy as a ladder, not a switch',
      p: [
        'Autonomy is set per project on a six-step ladder, borrowed from the orchestra: L0 solo (everything asks), L1 duet, L2 sectional, L3 ensemble (the default), L4 full orchestra and L5 unattended. L5 refuses to start without a sandbox and a token budget. Every change of level is written to the Ledger as decided by a human, and three gate denials in one session trip a circuit breaker that drops the session back to L1.'
      ]
    },
    {
      h: 'Spend agents like tokens',
      p: [
        'Agent sprawl is the new Big Ball of Mud (http://www.laputan.org/mud/). The spawn rule caps a session at two concurrent agents by default, never allows nested spawning, lets cheaper models run within the cap and asks before the most expensive one is used. When the cap is hit the agent is told exactly that: “this session already has 2 of 2 agents running; wait for one to finish, or raise max_agents in autonomy.yaml.”',
        'Each allowed spawn also files a card on a plain-files kanban board (a directory of markdown cards and an append-only history), moved to Review when the agent finishes cleanly or blocked with a reason. You can see what your fleet is doing without asking it.'
      ]
    },
    {
      note: 'This rule governs the agents that built this very website. It denied them more than once, correctly, and once incorrectly: its first live day produced a false “6 of 2 agents” denial, fixed in an amendment to the decision record. Dog-fooding finds the bugs that demos never will.'
    },
    {
      h: 'Prove it',
      p: [
        'Gates act before an action. Nothing, originally, checked what an agent said after. The “prove-it” check compares a claim of done with the Ledger’s record of allowed edits, test runs and commits, rather than asking the agent for more claims. Tests must have run after the last source edit, or the evidence is stale. A model-based second-in-command can waive a weak claim; it can never waive a contradicted one. Only a human can.'
      ]
    },
    {
      h: 'Measure before trusting',
      p: [
        'Cheap judges can lie, so every new judge and suggestion runs in shadow mode until its agreement with me has been measured. Eleven eval suites run on a schedule (regression suites nightly, capability suites weekly, and again on any model, prompt or binary change). Each run records the backend, model digest, prompt version and binary version, and reports pass rates with Wilson 95% confidence intervals. A suite has regressed only when the upper bound falls below the baseline’s lower bound.',
        'The discipline matters most when the numbers are disappointing. One fitted set of cascade thresholds was not applied because it scored an AUROC of 0.44, which would have sent every decision upstairs. A triage suggester showed 75% raw agreement that hid the fact it got only 14 of 56 accepts right. Both are written down. Negative results are results.'
      ]
    },
    {
      h: 'Design principles',
      p: ['The decisions behind the build, summarised:']
    },
    {
      list: [
        'CLI first. One binary; the Stage UI and eval suites are embedded, so there is nothing to deploy beside it.',
        'Local first. Everything binds to 127.0.0.1; models that judge run on the machine.',
        'A paper trail. The Ledger is hash-chained and never rotated, compressed or pruned, because that would break the chain. orchestra ledger verify reports the first broken link.',
        'Decisions recorded. 69 architecture decision records in nine days, plus research notes and a register of model trials (several rejected).',
        'Formal where it pays. The task state machine is specified in TLA+, with an invariant that the actor that fired implement cannot fire verify.',
        'Safe testing. Tests run against a temporary home and spare ports, never the live instance.'
      ],
      ordered: true
    },
    {
      h: 'Work in progress',
      p: [
        'It would be odd to write about honest reporting and not be honest about the gaps. There is no authentication yet, so the hosted version (phase 7) is parked until there is. Several features ship in shadow or switched off: reranking, an eval pre-grader and the prove-it enforcement. The small classifier is a weak, uncalibrated zero-shot judge, and it is treated as one. A stopped subagent that never reports back still holds its slot until a two-hour timeout. These are listed in the handover notes rather than discovered by surprise.'
      ]
    },
    {
      quote: 'Spend agents like tokens. Code checks before a local model, a local model before the Director, the Director before Roz.',
      cite: 'Agent Orchestra working principles, September 2026'
    },
    {
      h: 'Recommendations for any agentic workflow',
      p: ['Whether or not you ever run Orchestra, the following have held up and are worth adopting:']
    },
    {
      list: [
        'Put checks before actions, in order of cost. Most calls never need a model to approve them.',
        'Make denials instructive: name the rule, the blocked target and the alternative.',
        'Verify claims against evidence, not against more claims.',
        'Treat autonomy as a ladder with a circuit breaker, set per project.',
        'Cap concurrent agents and forbid nested spawning; the bill and the blast radius both scale with headcount.',
        'Run every judge in shadow until its agreement with a human is measured, and publish the negative results.',
        'Keep an append-only record of who decided what. You will need it the first time something goes wrong.'
      ],
      ordered: true
    },
    {
      p: [
        'Agent Orchestra is a personal, local-only project and is not yet published. If you lead an engineering team that is wrestling with the same questions, I am happy to compare notes.'
      ]
    }
  ]
};
