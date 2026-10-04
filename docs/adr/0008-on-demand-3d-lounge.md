# 0008. The 3D lounge loads only on demand, in the print style

- **Status:** Accepted · 2026-10-03

## Context
The Skyport is a delight feature, not the main path. Three.js and the scene are ~768 KB, and 3D on phones is costly.

## Decision
`lounge.html` shows a light boarding screen and a static chapter list first; Three.js loads via dynamic `import()` only on "Board the Skyport". The main site never loads or prefetches 3D code. The scene uses toon shading, ink outlines and the site palette, adapts pixel ratio to frame time and device class, pauses when hidden, and falls back to the static list without WebGL or under reduced motion.

## Consequences
The homepage stays fast; the lounge is opt-in and accessible by alternative. Visual consistency with the print system is kept at the cost of realism, by design.
