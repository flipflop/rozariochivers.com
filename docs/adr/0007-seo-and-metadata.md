# 0007. SEO and app metadata for a client-rendered static site

- **Status:** Accepted · 2026-10-04

## Context
Chapter and post pages are one HTML template each, filled from data by JS (`?p=slug`).

## Decision
Every page ships static, sensible defaults (title, description, canonical, Open Graph, Twitter large card, `lang="en-AU"`). On load, `project.js` and `post.js` sync title, description, canonical and social tags to the specific chapter or post. JSON-LD: Person and WebSite on the homepage, BlogPosting on posts. `sitemap.xml` lists every chapter and post; `robots.txt` points to it. Icons: `favicon.ico`, SVG favicon, Apple touch icon, 192/512 and maskable icons, and `site.webmanifest`.

## Consequences
Good previews when shared and indexable URLs for Google (which renders JS). Social scrapers that do not run JS see the template defaults on chapter URLs; pre-rendering per-chapter HTML would fix that if it matters.
