# 0003. Self-host fonts, Three.js and media; no third-party runtime requests

- **Status:** Accepted · 2026-10-02

## Context
Third-party CDNs and font services add privacy exposure, latency and a failure mode outside our control.

## Decision
Fonts (woff2, Latin subset), Three.js r170 and its addons, images, audio and video are all served from the site's own origin. External links are navigation only.

## Consequences
No cookies or trackers by default; the site works if a CDN is down. We own updates to Three.js (pinned in `vendor/three/`).
