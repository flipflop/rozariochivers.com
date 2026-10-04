# rozariochivers.com — *Technology Facts and Figures, 2026*

The portfolio of Rozario Chivers, set as a fictional companion volume to the 1958 almanac
*Aviation Facts and Figures*. Each project is a numbered chapter with a working interactive
"specimen"; a blog carries longer dispatches; and *The Skyport of Tomorrow* is a walkable
Three.js lounge where every monitor is a chapter.

**Live:** https://rozariochivers.com · **Repo:** https://github.com/flipflop/rozariochivers.com (public)

| Document | What it covers |
|---|---|
| [`DESIGN.md`](DESIGN.md) | The design system: 1950s print aesthetic, palette, typography, halftone and filter effects, illustration, UI controls, motion, accessibility, the 3D lounge |
| [`docs/adr/`](docs/adr/) | Architecture decision records: why the site is built the way it is |
| [`docs/HANDOFF.md`](docs/HANDOFF.md) | Specimen mount contract and the classes/tokens a specimen should use |
| [`docs/content-sources.md`](docs/content-sources.md) | Where every project fact came from |
| [`SPEC.md`](SPEC.md) | The original creative brief (historical; DESIGN.md is current) |

---

## Run it locally

No build step and no dependencies to install. ES modules need an HTTP origin, so serve the folder:

```bash
cd ~/Projects/Roz-Portfolio/portfolio
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` as a `file://` URL will not work (module scripts are blocked).

| Page | URL |
|---|---|
| Homepage (almanac) | `/` |
| A project chapter | `/project.html?p=<slug>` e.g. `?p=entropy-grid`, `?p=emote-go` |
| Blog index / a post | `/blog.html`, `/post.html?p=agent-orchestra` |
| 3D lounge | `/lounge.html` (`?3d` starts the scene immediately) |

Project slugs: `entropy-grid`, `wordsearch-ps`, `minimap-js`, `css-bullet-graph`, `sabre-wulf-vic20`,
`emote-go`, `emote-chat`, `emote-cli`.

---

## Project structure

```
index.html  project.html  post.html  blog.html  lounge.html     five entry pages
favicon.ico  site.webmanifest  robots.txt  sitemap.xml           SEO / app metadata
css/
  tokens.css      design tokens: inks, type, spacing, halftone patterns (start here)
  fonts.css       self-hosted @font-face (woff2, Latin subset)
  base.css        reset, paper grain overlay, skip link, focus, reduced motion
  components.css  plates, chamfer panels, board, ticker, charts, all specimen styles
  pages.css       page-level layout: cover, command band, Pilot, events, blog, figures
  lounge.css      the Skyport page only
js/
  main.js  project.js  post.js  blog.js  lounge.js               one orchestrator per page
  util/html.js     the `html` tagged-template engine (returns real DOM nodes)
  util/motion.js   scroll reveal, parallax hook
  components/      pure render functions: ui, board, sections, pilot, figures, blog,
                   illustrations (all hand-drawn SVG), diagrams (architecture SVGs)
  data/            ALL copy lives here: projects.js, profile.js, posts.js
  specimens/       one module per chapter's interactive specimen (lazy-loaded)
  lounge/          engine.js (renderer, input, camera, loop), world.js (scene build)
assets/
  fonts/  icons/  images/  photos/ (+ halftone.py)  illustrations/ (+ CREDITS.md)
  audio/emote-go/  code/  video/
vendor/three/     Three.js r170 + the three addons used (no CDN)
deploy/           publish.sh (every release), setup-domain.sh (one-time)
docs/             ADRs, handoff, content sources (blog research and review screenshots are git-ignored)
```

### How a page is built

Every page is static HTML with a `<main>` that a module fills from data. Components are pure
functions of props that return DOM via the `html` tagged template (no framework, no virtual DOM).
Copy is never written in components: change words in `js/data/*.js`. See ADR 0002.

```js
// js/components/ui.js
export function Tags({ items }) {
  return html`<ul class="tags">${items.map((t) => html`<li>${t}</li>`)}</ul>`;
}
```

### Adding or editing content

| To change… | Edit |
|---|---|
| A project chapter (title, standfirst, facts, body) | `js/data/projects.js` |
| Profile, career, figures, talks, ticker, Mould Detect panel, Theme Clock, publishing | `js/data/profile.js` |
| A blog post (body blocks: `h`/`p`, `list`, `note`, `code`, `quote`, `diagram`) | `js/data/posts.js` |
| A chapter illustration | `V[key]` in `js/components/illustrations.js` |
| An architecture diagram | `js/components/diagrams.js` |
| A specimen's behaviour | `js/specimens/<key>.js` (contract in `docs/HANDOFF.md`) |

New projects also need an entry in `sitemap.xml`.

### Cache busting (important)

Assets are cached by CloudFront and browsers. HTML is never cached; CSS and JS are cached for a day,
so **imports and stylesheet links carry manual version tags** (`?v=20261004f`). When you change a
CSS or JS file, bump its tag where it is referenced (the `<link>`/`<script>` in the HTML, or the
`import ... from './x.js?v=…'` line). Otherwise returning visitors keep the old file for up to a day.
See ADR 0005.

---

## Deploy

Hosting is the personal AWS account **771878896001** (never the Mould Detect account). See ADR 0006.

```bash
./deploy/publish.sh
```

It refuses to run against any other account, syncs to S3 with the right cache headers
(`no-cache` for HTML, one day for everything else), uploads the manifest with its MIME type,
skips anything private (`docs/`, `deploy/`, `*.md`, `*.py`, source photos), and invalidates CloudFront.

| Resource | Value |
|---|---|
| S3 bucket (private, SSE) | `rozariochivers-site-771878896001` (ap-southeast-2) |
| CloudFront | `E43V8YQ8YRZBM` → `d13jl4bypwal8y.cloudfront.net`, Origin Access Control |
| Certificate | ACM, us-east-1, `rozariochivers.com` + `www` |
| DNS | Route 53 zone `Z07029433JD6OPGI2LE6O`; Namecheap uses the four `awsdns` nameservers |
| Security headers | AWS managed `SecurityHeadersPolicy` (HSTS, nosniff, frame options, referrer) |

`deploy/setup-domain.sh` created all of the above and is idempotent; it only needs re-running
to rebuild the infrastructure.

### Git

```bash
gh auth switch -u flipflop     # personal account; the Mould Detect account is usually active
git push
gh auth switch -u mould-detect
```

---

## Testing

There is no test runner; verification is by rendering:

```bash
python3 -m http.server 8765 &
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --force-prefers-reduced-motion --hide-scrollbars --window-size=1440,2400 \
  --screenshot=/tmp/home.png http://localhost:8765/
```

Checklist before publishing: no console errors on `/`, every chapter and the post; no horizontal
scroll at 360px; reduced-motion renders final states; the lounge loads nothing until "Board" is
pressed (check the Network panel).

---

## Credits

- **Illustrations:** public-domain and CC0 artwork (Openclipart, Wikimedia Commons), recoloured
  and composed for this site, plus original SVG drawn for it. Full list: `assets/illustrations/CREDITS.md`.
- **TV portrait:** supplied by Rozario Chivers (ChatGPT-generated), recoloured to ink.
- **Fonts:** Marcellus, Oswald, Jost, IBM Plex Mono (SIL Open Font License), self-hosted.
- **Three.js** r170 (MIT), vendored.
- Style reference only: *Aviation Facts and Figures, 1958* (American Aviation Publications);
  no artwork from it is reproduced.
