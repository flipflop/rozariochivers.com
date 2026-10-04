# 0000. Record architecture decisions

- **Status:** Accepted · 2026-10-04

## Context
The site was built quickly across many iterations, with several non-obvious constraints (cache tags, account separation, licensing). These need to survive the next person, or the next session.

## Decision
Keep lightweight ADRs in `docs/adr/`, numbered, one decision each: Context, Decision, Consequences. Supersede rather than edit.

## Consequences
Decisions are discoverable from the README. Anything surprising in the code should point to an ADR.
