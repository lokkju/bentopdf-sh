# bentopdf.sh Website Design

**Date:** 2026-03-18
**Status:** Approved
**Branch:** `website` (in `bentopdf-sh` repo, mirrors trinops pattern)

---

## Overview

A public-facing website for the `bentopdf-sh` CLI tool, hosted at `https://bentopdf.sh`. Built with Astro + Starlight, following the same structure as the `lokkju/trinops` website branch. Comprises a custom marketing landing page and a full Starlight docs site.

---

## Stack

- **Framework:** Astro with `@astrojs/starlight`
- **Branch:** `website` in `bentopdf-sh` repo
- **Site URL:** `https://bentopdf.sh`
- **Landing page:** `src/pages/index.astro` — standalone Astro page, no Starlight wrapper
- **Docs:** `src/content/docs/` — Starlight content collection
- **Styles:** `src/styles/custom.css` — Starlight accent overrides
- **No framework components** — pure HTML/CSS/vanilla JS (same as trinops)
- **`content.config.ts`** — same as trinops: `docsLoader` + `docsSchema` from `@astrojs/starlight/schema`

---

## Color Palette

Derived from bentopdf.com's Tailwind color usage:

```css
:root {
  --bg:        #111827;  /* gray-900 */
  --bg-card:   #1f2937;  /* gray-800 */
  --bg-alt:    #161d2e;  /* cool mid-tone */
  --indigo:    #6366f1;  /* indigo-500, primary accent */
  --indigo-hi: #818cf8;  /* indigo-400, text/icon accent */
  --text:      #e5e7eb;  /* gray-200 */
  --text-dim:  #9ca3af;  /* gray-400 */
  --border:    #374151;  /* gray-700 */
  --sans:      'DM Sans', system-ui, sans-serif;
  --mono:      'JetBrains Mono', 'Fira Code', monospace;
}
```

Starlight overrides in `custom.css`:
```css
--sl-color-accent:      #6366f1;
--sl-color-accent-high: #818cf8;
--sl-color-accent-low:  #1e1b4b;
--sl-font:              'DM Sans', system-ui, sans-serif;
```

### Font Loading

DM Sans and JetBrains Mono are loaded from Google Fonts in the `<head>` of `index.astro` (and via Starlight `head:` config for docs). Weights: DM Sans 400, 500, 600, 700; JetBrains Mono 400, 600.

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
```

---

## Landing Page (`src/pages/index.astro`)

Four full-screen scroll-snap sections + a detached footer (follows trinops pattern — the footer is a `<footer>` element below the snap sections, not itself a snap section).

### Section 1 — Hero
- Eyebrow badge: `BENTOPDF.SH` (monospace, indigo pill)
- Title: "Documents to PDF. Locally." (large gradient text, white → indigo)
- Tagline: "WASM-powered conversion — no uploads, no cloud, no dependencies."
- Install tabs (vanilla JS tab switcher):
  - `npx` — one-shot: `npx bentopdf-sh report.docx`
  - `npm` — global install: `npm install -g bentopdf-sh`
- CTA buttons: "Get Started →" (indigo primary, links to `/docs/getting-started/`) + "GitHub" (secondary)
- Background: radial gradient from indigo at top fading to `--bg`

### Section 2 — Features
Four feature cards in a `repeat(auto-fit, minmax(300px, 1fr))` grid:
1. **Private by default** — runs entirely in-process, nothing leaves your machine
2. **WASM-powered** — same engines as the BentoPDF web app, driven from Node.js
3. **15+ formats** — DOCX, PPTX, XLSX, PDF, Markdown, HTML, images and more
4. **AI-native** — first-class Claude Code skill, one command to install

### Section 3 — Supported Formats
Compact badge/pill grid grouped by category (no full table — save that for the docs page):
- **Office:** DOCX, XLSX, PPTX, ODT, ODS, ODP, RTF
- **Documents:** PDF (merge/convert), Markdown, HTML
- **Images:** PNG, JPEG, SVG (via mupdf)

### Section 4 — Quick Start
Three numbered steps (follows trinops step card pattern):
1. **Install** — `npm install -g bentopdf-sh`
2. **Convert** — `bentopdf report.docx` or `bentopdf *.png merged.pdf`
3. **Add to Claude Code** — `npx skills add lokkju/bentopdf-sh -a claude-code`

### Footer (detached, not a snap section)
- Brand mark + `bentopdf.sh`
- Nav links: Getting Started, CLI Reference, Supported Formats, Claude Code, Troubleshooting, GitHub
- "Powered by [BentoPDF](https://bentopdf.com)" attribution
- [AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html) license link
- "Built with ♥ by lokkju"

### Mobile (≤ 640px)
Follows trinops breakpoint pattern: feature card grid collapses to single column, snap sections use `padding: 5rem 1rem 2rem`, header padding reduces to `0 1rem`.

---

## Docs Site (`src/content/docs/`)

### Sidebar Structure

Four Starlight sidebar groups with literal `label:` strings in `astro.config.mjs`:

```
"Start Here"
  └─ Getting Started        slug: docs/getting-started
"Reference"
  ├─ CLI Reference           slug: docs/cli-reference
  └─ Supported Formats       slug: docs/supported-formats
"Integrations"
  └─ Claude Code             slug: docs/claude-code
"Guides"
  └─ Troubleshooting         slug: docs/troubleshooting
```

No `index.mdx` at the `src/content/docs/` root — the docs root (`/docs/`) is handled via Astro `redirects` in `astro.config.mjs`: `'/docs/': '/docs/getting-started/'`.

### Page Content

**Getting Started** — Prerequisites (Node.js 18+), install via npm/npx, first conversion example (`bentopdf report.docx`), link to CLI reference.

**CLI Reference** — Full flag reference for both invocation forms:
- Global install (`npm install -g bentopdf-sh`): `bentopdf to-pdf …`
- One-shot (`npx bentopdf-sh`): `npx bentopdf-sh to-pdf …`

The binary name is `bentopdf` (set in `package.json` `bin`); the npm package name is `bentopdf-sh`. All examples in the docs use the short `bentopdf` form with a note at the top explaining the npx equivalent.

Covers: `to-pdf` flag reference (`--output`, `--overwrite`, batch globs), `cache` subcommands (list, clear), exit codes table (0 success / 1 conversion error / 2 bad args / 3 download failure).

**Supported Formats** — Full format table: input format, extension(s), engine used (mupdf / pandoc / libreoffice), notes/limitations.

**Claude Code** — Install the skill (`npx skills add lokkju/bentopdf-sh -a claude-code`), what the skill does, example prompts, manual plugin install path (`.claude/plugins/bentopdf/`).

**Troubleshooting** — Cache location (`~/.cache/bentopdf/`), cache clear command, common errors (engine load failures, unsupported format, WASM memory limits).

---

## File Structure

```
bentopdf-sh/ (website branch)
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── public/
│   ├── favicon.svg
│   └── og.png              # Placeholder OG image (1200×630, added before launch)
└── src/
    ├── pages/
    │   └── index.astro     # Custom landing page (standalone, no Starlight wrapper)
    ├── content/
    │   └── docs/
    │       └── docs/
    │           ├── getting-started.mdx
    │           ├── cli-reference.mdx
    │           ├── supported-formats.mdx
    │           ├── claude-code.mdx
    │           └── troubleshooting.mdx
    ├── content.config.ts   # docsLoader + docsSchema (same as trinops)
    └── styles/
        └── custom.css      # Starlight accent + font overrides
```

---

## Social / Meta

All pages include:
- `og:type`, `og:url` (landing page only — static value, omitted from Starlight docs head to avoid wrong-URL bugs), `og:title` (`"bentopdf.sh — Documents to PDF. Locally."`), `og:description`, `og:image`
- `twitter:card: summary_large_image`, `twitter:image`
- `description`: "WASM-powered document-to-PDF conversion for the command line. No uploads, no cloud."
- OG image: `https://bentopdf.sh/og.png` (placeholder; add real image before launch)

Configured in `index.astro` head for landing page, and via Starlight `head:` array in `astro.config.mjs` for docs pages.

---

## Deployment

Deploy to **Cloudflare Pages** from the `website` branch (same pattern as trinops). Project name: `bentopdf-sh`. Build command: `npm run build`. Output dir: `dist/`. Add a CI build-check workflow that runs `astro build` on PRs to the `website` branch.
