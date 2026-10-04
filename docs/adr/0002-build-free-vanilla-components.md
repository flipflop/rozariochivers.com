# 0002. Build-free vanilla ES modules with template-literal components

- **Status:** Accepted · 2026-10-02

## Context
The site is small, mostly static, and maintained by one person with AI assistance. Framework tooling would add build steps, dependency upgrades and bundle weight for little benefit.

## Decision
No framework, no bundler, no npm. Pages are static HTML; components are pure functions of props returning real DOM via the `html` tagged template in `js/util/html.js`. All copy lives in `js/data/*.js`. Specimens and the lounge are separate modules loaded on demand.

## Consequences
Zero build, any static host, readable source. Trade-offs: no automatic cache-hashing (see 0005), no type checking, and SEO relies on crawlers running JS for chapter and post pages (mitigated with static meta defaults and per-page meta sync, see 0007).
