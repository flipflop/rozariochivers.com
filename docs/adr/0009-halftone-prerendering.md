# 0009. Pre-render photographic halftones offline

- **Status:** Accepted · 2026-10-03

## Context
Photos (event talks, the portrait) need the two-ink print treatment. Doing it in canvas at runtime costs CPU and delays first paint.

## Decision
`assets/photos/halftone.py` renders 45° ink dot screens with a mis-registered blue under-print to PNG at authoring time. Product screenshots are not halftoned (they lose recognition) and are framed instead.

## Consequences
No runtime cost; consistent output. Changing the look means re-running the script (source photos are kept as `*-src.png` / originals and are excluded from deploy).
