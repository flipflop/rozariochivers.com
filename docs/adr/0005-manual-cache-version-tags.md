# 0005. Cache busting with manual `?v=` version tags

- **Status:** Accepted · 2026-10-03

## Context
Without a build step there are no content-hashed filenames. Browsers and CloudFront cached old CSS/JS, so edits did not appear (stretched images, missing styles, stale specimens).

## Decision
HTML is served `no-cache`; CSS, JS and media are cached for a day. Every stylesheet link and module import that changes carries a manual tag (`file.js?v=YYYYMMDDx`), bumped when the file changes. `deploy/publish.sh` also invalidates CloudFront.

## Consequences
Updates appear on the next page load. The cost is discipline: forget to bump a tag and returning visitors see the old file for up to a day. Revisit with a tiny hashing script if edits become frequent.
