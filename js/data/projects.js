/**
 * Project chapters for "Technology Facts and Figures, 2026".
 * Facts are drawn from each repository's README, commit history and live page
 * (see docs/content-sources.md). Nothing here is estimated or invented.
 *
 * @typedef {Object} Section
 * @property {string} h    Section heading.
 * @property {string[]} p  Paragraphs of plain modern English.
 *
 * @typedef {Object} Project
 * @property {number} n            Chapter number (1-8).
 * @property {string} slug         URL slug, used as project.html?p=<slug>.
 * @property {string} flight       Departures-board code, e.g. 'EG-01'.
 * @property {string} title
 * @property {string} year         Year (or span) the work was made.
 * @property {string} kind         Short category line.
 * @property {string} status       Departures-board status word.
 * @property {string} live         Live demo / page URL.
 * @property {string} source       GitHub repository URL.
 * @property {string} standfirst   One sentence, 30 words or fewer.
 * @property {string[]} tags
 * @property {Array<[string, string]>} facts   3-6 label/value rows.
 * @property {Section[]} body
 * @property {string} pull         Pull quote.
 * @property {string} specimen     Key into js/specimens/*.js.
   What this shows about Roz as CTO / innovator.
 *
 * @type {Project[]}
 */
export const PROJECTS = [
  {
    n: 1,
    slug: 'entropy-grid',
    flight: 'EG-01',
    title: 'Entropy Grid',
    year: '2026',
    kind: 'Hardware entropy · Canvas',
    status: 'BOARDING',
    live: 'https://flipflop.github.io/Entropy-Grid/',
    source: 'https://github.com/flipflop/Entropy-Grid',
    standfirst:
      'A laptop microphone, listened to for its hiss rather than its voice, becomes a source of genuinely unpredictable numbers and a grid for testing a curious idea.',
    tags: ['Web Audio', 'AudioWorklet', 'SHA-256', 'Statistics', 'ES Modules', 'Zero dependencies'],
    facts: [
      ['Entropy source', 'Johnson–Nyquist (thermal) noise in the mic pre-amplifier'],
      ['Pipeline', 'Von Neumann debiasing, SHA-256 whitening, rejection sampling'],
      ['Diagnostics', 'Chi-squared, autocorrelation and runs tests, live'],
      ['Grid sizes', '20×20, 50×50, 100×100'],
      ['Dependencies', 'None; ES modules, no build step'],
      ['Built', 'May 2026, pair-programmed with Claude']
    ],
    body: [
      {
        h: 'Where the idea came from',
        p: [
          'Roz had long been curious about where applications get their randomness. He had toyed with browser and operating-system fingerprints, such as the list of installed fonts, and with CPU and GPU temperatures and fan speeds as seeds for apps and games. Along the way he kept noticing the same complaint: pseudo-random number generators are deterministic, and cryptography in particular wants entropy from outside the machine, ideally from the environment.',
          'While probing how far into the ultrasound range a laptop microphone could hear (not very far, as it turns out), he and Claude noticed something more useful. The microphone pre-amplifier exposes broadband thermal noise, known as Johnson–Nyquist noise, produced by the chaotic motion of electrons. That hiss can be digitised and turned into a sequence that is not pseudo-random.'
        ]
      },
      {
        h: 'The real intent: a thought experiment',
        p: [
          'The generator is a means to an end. Roz had read of an experiment in which a potted plant was placed beneath an array of lights, each switched on and off at random. As the plant was moved to different positions in the space below, the pattern of activations was reported to shift with it: rather than spreading evenly, as a random process should, the lights that switched on clustered around wherever the plant had been relocated.',
          'The experiment was really an investigation into a much larger question: whether the presence of an observer, or of a living system, can influence outcomes that ought to be purely random. In quantum terms, it touches on the idea that observation plays a part in how a system in superposition, with many possible outcomes held in coherence, settles into one definite state.',
          'Part of the Entropy Grid experiment is an attempt to recreate that set-up with a different source of chance. Instead of a conventional random number generator, each cell in the grid is driven by Johnson–Nyquist noise, the random fluctuations produced by the chaotic thermal motion of electrons in the microphone pre-amplifier. Drop a plant marker onto the grid, and the heat map shows whether activations begin to gather around it.',
          'It remains a thought experiment, and the project is open about that. It makes no claim that the effect is real, or that it has been reproduced here; the original result is contested, and any apparent clustering in a short run is exactly what chance alone produces. What Entropy Grid provides is a clean, physical source of randomness, an instrumented grid, and a z-score that says whether any structure is larger than chance would explain.'
        ]
      },
      {
        h: 'How the numbers are made',
        p: [
          'Audio is requested with echo cancellation, noise suppression and automatic gain all switched off, because those filters remove exactly the noise being harvested. An AudioWorklet on the audio thread reads the two least-significant bits of each 32-bit float sample, then applies Von Neumann debiasing: pairs of bits are compared, equal pairs are discarded, and the rest are emitted as fair bits whatever the underlying bias.',
          'Debiased bits pass into a 65,536-bit ring buffer. SHA-256 whitening removes any residual structure, and rejection sampling turns bytes into decimal digits without the modulo bias a naive remainder would introduce. The README records that bytes of 250 and above are rejected so each digit has exactly a one-in-ten chance.'
        ]
      },
      {
        h: 'Seeing whether it is random',
        p: [
          'The digits drive a heatmap grid coloured by Z-score against a uniform expectation. Alongside it run a chi-squared goodness-of-fit test (with the p-value computed by the Wilson–Hilferty approximation) and autocorrelation and runs tests, plotted as a live trend chart. A healthy generator should show a near-neutral field with occasional flickers.',
          'The code follows plain engineering discipline: an observer-style entropy pool, a facade over the RNG, a strategy-swappable hash, and a session guard against stale async callbacks.'
        ]
      }
    ],
    pull: 'Entropy Grid is an artistic and dialectical exploration of the observer effect, quantum decoherence, and random number generation linked to physical, real-world effects.',
    specimen: 'entropy'
  },
  {
    n: 2,
    slug: 'wordsearch-ps',
    flight: 'WS-02',
    title: 'Word Search for PostScript',
    year: '1995 / 2026',
    kind: 'Interpreter · Canvas',
    status: 'ON TIME',
    live: 'https://flipflop.github.io/WordSearchPS/',
    source: 'https://github.com/flipflop/WordSearchPS',
    standfirst:
      'A word-search game Roz wrote in PostScript as a first-year student in 1995, revived in the browser by a PostScript interpreter built from scratch.',
    tags: ['PostScript', 'Interpreter', 'Canvas 2D', 'Vanilla JS', 'No build step'],
    facts: [
      ['Original', 'May 1995, University of Hertfordshire, UK'],
      ['Course', 'BSc Software Systems for Arts and Media, first year'],
      ['Grid', '5×5 letters, 8 hidden networking terms'],
      ['Interpreter', 'PostScript Level 1 and 2 subset, 80+ operators'],
      ['Web revival', 'April 2026'],
      ['Stack', 'Six ES modules, no dependencies']
    ],
    body: [
      {
        h: 'A first-year assignment, kept',
        p: [
          'Roz wrote this game in May 1995, in the Computing and Representation module of the first year of the BSc Software Systems for Arts and Media at the University of Hertfordshire. It was written for the command-line GhostScript interpreter on a PC, and the whole game, from background and grid to typography, colour fills and the word-finding procedures, is plain PostScript.',
          'The grid is 5×5, and hidden in it are eight networking terms from the early internet: MODEM, NET, HOST, LOGIN, FTP, LAN, NODE and BIT. Each word you find draws a red cross-out line, adds a blue label and reveals one red letter of a hidden message.'
        ]
      },
      {
        h: 'Bringing it to the web without changing it',
        p: [
          'The interesting decision was not to port the game. The original wordsearch.ps is kept unmodified, and instead Roz built a PostScript interpreter in JavaScript that renders onto an HTML canvas. Nearly thirty years on, the 1995 source runs as it was written.',
          'The interpreter is a lexer and parser, a stack machine with a dictionary stack, a graphics engine handling paths, gsave and grestore, transforms and text layout, and a font mapper from PostScript font names to web fonts. It implements a subset of PostScript Level 1 and 2, with more than eighty built-in operators, which is enough to run the game faithfully.'
        ]
      },
      {
        h: 'A playground, not just a port',
        p: [
          'The page includes a PostScript REPL with command history, a live operand-stack viewer and a source editor, so a visitor can change the game and re-render it. A spoiler-free mode hides the word buttons until you ask for them. You can type a word such as modem straight into the REPL and watch the stack machine reveal it.',
          'The project is six standalone modules and a stylesheet. There is no framework and no build step; it needs only a static file server.'
        ]
      }
    ],
    pull: 'The 1995 source runs unmodified; it is the machine underneath that is new.',
    specimen: 'wordsearch'
  },
  {
    n: 3,
    slug: 'minimap-js',
    flight: 'MM-03',
    title: 'minimap-js',
    year: '2026',
    kind: 'Art project · Code visualisation',
    status: 'ON TIME',
    live: 'https://flipflop.github.io/minimap-js/',
    source: 'https://github.com/flipflop/minimap-js',
    standfirst:
      'An art project and alternative code-visualisation tool: drop in any source file and its typography becomes an image, where leading, rivers of white space and line density give every file a distinctive shape.',
    tags: ['Generative art', 'Typography', 'Code visualisation', 'Canvas', 'Unicode blocks', 'highlight.js'],
    facts: [
      ['Render modes', 'Canvas (PNG) and Unicode block characters'],
      ['Languages', '24, with auto-detection (highlight.js)'],
      ['Themes', 'Monokai, GitHub, Dracula, Solarized Dark, Nord'],
      ['Export', 'PNG or plain-text ASCII'],
      ['Inspired by', 'The Python minimap project by Ivoah'],
      ['Built', 'April 2026']
    ],
    body: [
      {
        h: 'Code as a typographic surface',
        p: [
          'minimap-js began as a tool and became an art project. It takes the thin overview strip many editors show beside a file, where each character is a tiny block, and treats it as an image in its own right. Drop a source file onto the page and the code is redrawn as texture: no syntax to read, only the shape that the writing makes.',
          'Seen this way, code behaves like any other set type. Indentation becomes margin, blank lines become leading, long expressions run to a ragged right edge, and the gaps between tokens line up into rivers of white space, the same rivers a typesetter would work to remove from a page of prose.'
        ]
      },
      {
        h: 'Leading, rivers and line density',
        p: [
          'The interesting part is how much of a program’s character shows up in those typographic properties alone. Dense, deeply nested logic prints as a dark, heavy block. Configuration files read as narrow columns with regular leading. Generated code has an unnaturally even texture, and hand-written code drifts. Two files that do the same job in different styles look nothing alike.',
          'The specimen above shows one of Roz’s own files, feature-flags.js from 2018, beside its minimap: the real image rendered by the Code-Mini-Maps tool, and a live Unicode-block version drawn in the browser. Its long JSDoc comment blocks print as pale grey plates, the parsing logic as a dense, indented column, and the blank lines between functions as open leading.'
        ]
      },
      {
        h: 'Two ways to draw it',
        p: [
          'In Canvas mode each character becomes a small coloured rectangle, with whitespace left transparent so the background shows through. In Unicode Block mode each character is mapped to a shading glyph by type: letters to a full block, digits to a medium shade, brackets and punctuation to a dark shade, and other symbols to a light shade, each coloured with its syntax-highlight colour.',
          'Both outputs can be saved, as a PNG print or as plain-text ASCII art that survives being pasted into a README or a terminal. Five colour themes and 24 languages are supported through highlight.js, and controls for character width, height and row spacing let you tune the leading and density of the image directly.'
        ]
      }
    ],
    pull: 'Indentation becomes margin, blank lines become leading, and the gaps between tokens line up into rivers.',
    specimen: 'minimap'
  },
  {
    n: 4,
    slug: 'css-bullet-graph',
    flight: 'BG-04',
    title: 'Bullet Graph CSS',
    year: '2014',
    kind: 'Data visualisation · Pure CSS',
    status: 'ON TIME',
    live: 'https://flipflop.github.io/CSSBulletGraph/',
    source: 'https://github.com/flipflop/CSSBulletGraph',
    standfirst:
      'Stephen Few’s bullet graph, drawn with nothing but CSS: no JavaScript, no images, and a small CSS API for bar, marker and background bands.',
    tags: ['CSS', 'HTML', 'Data visualisation', 'Responsive', 'No JavaScript'],
    facts: [
      ['Version', '0.1, 20 June 2014'],
      ['Licence', 'Creative Commons Attribution 3.0'],
      ['JavaScript', 'None; pure CSS'],
      ['Sizes', 'Small, Medium, Large, XLarge'],
      ['Customisation', 'Bar width and colour, marker, background bands']
    ],
    body: [
      {
        h: 'A chart for a single number',
        p: [
          'The bullet graph was designed by Stephen Few as a compact replacement for the dashboard gauge. A single bar shows a value, a marker shows a target, and bands behind them show the qualitative ranges, such as poor, satisfactory and good. It carries a lot of information in a small, horizontal space.',
          'In June 2014 Roz published a version built from CSS alone, released under a Creative Commons Attribution licence as version 0.1.'
        ]
      },
      {
        h: 'Style as the API',
        p: [
          'The interesting part is the interface. There is no script to call. The graph is ordinary markup, and you configure it by overriding a handful of CSS classes: the bar width and colour, the marker and its distance, and the width and colour of each background step. The project page demonstrates a default graph, a recoloured one with custom bands, and a set of sizes from small to extra large.',
          'Because widths are percentages, the graphs are responsive. The project lists its features simply: simple to use, customisable, pure CSS, sans JS.'
        ]
      },
      {
        h: 'Looking ahead, then and now',
        p: [
          'The repository records planned features: a vertically oriented graph, text-label formatting, and a bar chart across two segments such as current and projected values. It also points to other bullet-graph implementations, which is a courtesy to the field Roz was working in. The repository stayed quiet for years before a deployment workflow was added in 2026 so the demo page stays live.',
          'The demo page itself is a short, readable gallery of examples with their CSS beside them, which is how the project teaches: show the markup, show the three or four overrides, and let the result speak.'
        ]
      }
    ],
    pull: 'No script to call. The graph is markup, and the interface is the stylesheet.',
    specimen: 'bullet'
  },
  {
    n: 5,
    slug: 'sabre-wulf-vic20',
    flight: 'SW-05',
    title: 'Vic20 Nostalgia',
    year: '1984 / 2026',
    kind: 'Restoration · Retro computing',
    status: 'ON TIME',
    live: 'https://flipflop.github.io/sabre-wulf-vic20/',
    source: 'https://github.com/flipflop/sabre-wulf-vic20',
    standfirst:
      'A Commodore VIC-20 hand-written platform game design, restored from the original graph-paper and binary notation of a thirteen-year-old who wanted to write his own version of Ultimate’s classic 1984 action-adventure game, Sabre Wulf.',
    tags: ['Commodore VIC-20', 'Commodore BASIC', 'Node.js', 'Generated HTML', 'AI-assisted restoration'],
    facts: [
      ['Original', 'Graph-paper notes, c. 1984'],
      ['Machine', 'Commodore VIC-20, programmed in Commodore BASIC'],
      ['Sprite format', '8×8 pixels, each row converted binary to decimal for DATA statements'],
      ['Output', 'Self-contained HTML atlas, plus a PDF edition'],
      ['Restored', 'August 2026, with Claude Fable 5']
    ],
    body: [
      {
        h: 'Notes from 1984',
        p: [
          'Roz was thirteen when he saw Ultimate’s Sabre Wulf and set out to write his own adventure game in Commodore BASIC on the family VIC-20. The graphics were designed on graph paper: each sprite was an 8×8 grid, and each row was converted by hand from binary to decimal, ready to be typed into BASIC DATA statements.',
          'Decades later the surviving pages were scanned, transcribed and re-set as a digital atlas: Vic20 Nostalgia.'
        ]
      },
      {
        h: 'Restoring the information',
        p: [
          'Vic20 Nostalgia is a restoration rather than a recreation. Claude Fable 5 was used to analyse the scanned graph-paper notes and recover the hand-written information, and the repository credits it as such. The transcribed sprite bytes and notes live as JSON files and are the source of truth.',
          'A small Node script, tools/build-atlas.mjs, generates the finished index.html from that data, so the atlas can be rebuilt at any time and is never edited by hand. The commit history notes that the atlas includes the original page scans, an interactive animation player and a PDF edition.'
        ]
      },
      {
        h: 'Data first, presentation generated',
        p: [
          'The structure is worth noticing. The scans are kept as evidence, the transcription is kept as data, and the page is a build artefact. That makes the restoration auditable: anyone can check a sprite against the page it came from, and fix a mistake in one place.',
          'The result is a single self-contained HTML file, with a PDF alongside, hosted on GitHub Pages, where anyone can scroll through the sprites, watch them animate, or download the PDF edition.'
        ]
      }
    ],
    pull: 'Eight pixels wide, eight rows deep, each row worked out by hand from binary to decimal.',
    specimen: 'sabre'
  },
  {
    n: 6,
    slug: 'emote-go',
    flight: 'EM-06',
    title: 'emote-go',
    year: '2026',
    kind: 'Local AI · Go CLI',
    status: 'BOARDING',
    live: 'https://github.com/flipflop/emote-go',
    source: 'https://github.com/flipflop/emote-go',
    standfirst:
      'One binary, zero dependencies: a Go command-line tool that gives Claude Code an emotional voice, with text-to-speech running entirely on your own machine.',
    tags: ['Go', 'sherpa-onnx', 'ONNX Runtime', 'cgo', 'Claude Code hooks', 'macOS arm64'],
    facts: [
      ['Version', 'v0.1.0, August 2026'],
      ['Engine', 'sherpa-onnx pocket-tts, embedded and on-device'],
      ['Latency', '0.2–0.35 s to first audio on Apple Silicon (per README)'],
      ['Bundle', '12 MB binary plus two dylibs; ~160 MB one-time model download, sha256-verified'],
      ['Privacy', 'No text leaves the machine']
    ],
    body: [
      {
        h: 'A binary that just talks',
        p: [
          'Working with Claude Code is a conversation, but a silent one. emote-go lets you look away from the terminal: it reads Claude’s responses aloud in a voice that matches the mood, with the speech generated locally. The stated north star is one artefact and zero prerequisites. You download a binary, run one provisioning command, and Claude Code speaks.',
          'It is a standalone Go port of the Python emote-cli, with the same command-line surface, a byte-compatible config file and the same hook semantics, plus an embedded on-device text-to-speech engine so no server needs to be running.'
        ]
      },
      {
        h: 'How it is built',
        p: [
          'The commit message lays out the structure. A text extractor is a behaviour-parity port of the Python one, with five modes (verbose, summarised, important, warnings and code) golden-file tested against the reference. A parity-tested sentiment classifier picks the emotion. An embedded sherpa-onnx pocket-tts engine, called through cgo, renders each sentence, with onset checks and per-emotion reference voices.',
          'First run provisions the model and voices from a release, with sha256 verification and resumable downloads. Playback uses a detached CoreAudio path with an afplay fallback, and a hooks package installs and removes the Claude Code Stop and Notification hooks. The bundle is relocatable and ad-hoc signed, because on recent macOS signing is not optional.'
        ]
      },
      {
        h: 'Three tiers, chosen automatically',
        p: [
          'At run time it uses a healthy emote-chat server on port 8123 if one is present, for the full voice catalogue and a warm model. Otherwise it uses the embedded engine, and if neither is available it shows a friendly provisioning prompt while hooks stay silent. Hooks are designed never to get in the way.',
          'Behaviour can be steered per session with environment variables, and per project with the emote here command.'
        ]
      }
    ],
    pull: 'One artefact, zero prerequisites, and no text ever leaves the machine.',
    specimen: 'emote-go'
  },
  {
    n: 7,
    slug: 'emote-chat',
    flight: 'EM-07',
    title: 'emote-chat',
    year: '2026',
    kind: 'Local AI · Voice chat',
    status: 'ON TIME',
    live: 'https://github.com/flipflop/emote-chat',
    source: 'https://github.com/flipflop/emote-chat',
    standfirst:
      'A voice chat that hears how you said something, not just what you said, and answers in an emotional voice, entirely offline on Apple Silicon.',
    tags: ['Moonshine WASM', 'emotion2vec', 'Ollama', 'pocket-tts', 'FastAPI', 'Vanilla JS'],
    facts: [
      ['Speech to text', 'Moonshine Tiny (WASM), in the browser'],
      ['Emotion detection', 'emotion2vec via FunASR, on CPU'],
      ['Chat model', 'Local Ollama; default a 35B mixture-of-experts (~3B active)'],
      ['Speech', 'pocket-tts, streamed WAV'],
      ['Reference machine', 'M1 Mac, 32 GB'],
      ['Released', 'August 2026']
    ],
    body: [
      {
        h: 'The whole loop, locally',
        p: [
          'Voice assistants that understand how you said something normally live in someone else’s data centre. emote-chat sets out to prove the entire loop can run locally and privately on modest hardware, with the reference machine an M1 Mac with 32 GB. Your voice never leaves the machine, and the assistant both hears your emotion and speaks with one of its own.',
          'It began as an experiment in wiring in-browser speech recognition to a local language model and grew into a family of three projects.'
        ]
      },
      {
        h: 'What happens when you talk',
        p: [
          'Speech-to-text runs in the page using Moonshine Tiny compiled to WebAssembly, so nothing is uploaded for recognition. The raw utterance audio is also sent to a local server, where emotion2vec classifies it as happy, surprised, negative or neutral. The transcript and detected emotion then prompt a local Ollama model, which returns a reply along with the voice emotion it wants to express. Finally pocket-tts streams back audio, using either a single catalogue voice or a per-emotion voice bank.',
          'A FastAPI server on port 8123 serves both the web interface and the API from one origin, with voice and model selection in the settings. The default chat model is a 35B mixture-of-experts with about 3B parameters active, chosen for near-4B speed with better coherence.'
        ]
      },
      {
        h: 'Honest limits',
        p: [
          'The README is candid. It is developed and tuned on Apple Silicon only. Microphone access from a phone over the local network needs HTTPS, because browsers block it otherwise. Emotion detection is coarse: four labels, classified after you release the talk button.',
          'Voice states and non-commercially licensed audio are left out of the public repository, with licensing explained in a notice file. The repository also holds the Go feasibility research, including engine deep dives and a text-to-speech landscape survey, that led to emote-go.'
        ]
      }
    ],
    pull: 'Your voice never leaves your machine, and the assistant both hears your emotion and speaks with one of its own.',
    specimen: 'emote-chat'
  },
  {
    n: 8,
    slug: 'emote-cli',
    flight: 'EM-08',
    title: 'emote-cli',
    year: '2026',
    kind: 'Developer tooling · Python CLI',
    status: 'ON TIME',
    live: 'https://github.com/flipflop/emote-cli',
    source: 'https://github.com/flipflop/emote-cli',
    standfirst:
      'Pipe in any output, or install its hooks, and hear Claude Code read each response aloud in a voice that matches the mood: tests pass and it sounds happy.',
    tags: ['Python', 'Standard library only', 'Claude Code hooks', 'Test oracle', 'Accessibility'],
    facts: [
      ['Language', 'Python 3.11+, standard library only'],
      ['Modes', 'verbose, summarised (default), important, warnings, code'],
      ['Hooks', 'Claude Code Stop and Notification, idempotent install'],
      ['Playback', 'macOS afplay'],
      ['Role', 'Reference implementation and test oracle for emote-go']
    ],
    body: [
      {
        h: 'Looking away from the terminal',
        p: [
          'emote exists so you can look away. It turns Claude Code’s responses, or anything you pipe into it, into short spoken summaries with a tone that carries the verdict before the words do: tests pass and it sounds happy, a traceback and it sounds sad, an explanation comes out calm. Piping works for anything, so pytest 2>&1 | emote speaks the verdict of a test run.',
          'It speaks through the local emote-chat text-to-speech server, and plays audio with macOS afplay.'
        ]
      },
      {
        h: 'Design goals',
        p: [
          'There were three stated goals. It is zero-dependency: Python 3.11 or later and the standard library, with no virtual environment, pip or npm. It is never in the way: hooks always exit with success and fire and forget, so a dead server or a broken speaker cannot block a Claude session. And it is deterministic and testable: sentiment, extraction and hook behaviour are pure functions with table-driven tests.',
          'That last goal paid off, because the test suite became the oracle that the Go port had to match byte for byte.'
        ]
      },
      {
        h: 'What it can do',
        p: [
          'Five modes decide what gets spoken, including a code mode, described as an accessibility feature, that reads code aloud with symbols verbalised. A deterministic lexicon classifier chooses between happy, sad, excited, calm and neutral. Commands such as emote here off and environment variables like EMOTE_MODE steer behaviour per directory and per session. Emoji are spoken by their official Unicode CLDR names, so a party emoji becomes “party popper”, including skin tones, flags and joined sequences.',
          'Limits are stated plainly: playback is macOS only, the emote-chat server must be running, and the sentiment lexicon is English-centric.'
        ]
      }
    ],
    pull: 'Tests pass and it sounds happy; a traceback and it sounds sad.',
    specimen: 'emote-cli'
  }
];
