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

Starlight overrides:
```css
--sl-color-accent:      #6366f1;
--sl-color-accent-high: #818cf8;
--sl-color-accent-low:  #1e1b4b;
```

Font: **DM Sans** (bentopdf.com's font) for body, JetBrains Mono for code.

---

## Landing Page (`src/pages/index.astro`)

Five full-screen scroll-snap sections, matching trinops layout structure.

### Section 1 — Hero
- Eyebrow badge: `BENTOPDF.SH` (monospace, indigo pill)
- Title: "Documents to PDF. Locally." (large gradient text)
- Tagline: "WASM-powered conversion — no uploads, no cloud, no dependencies."
- Install tabs (vanilla JS tab switcher):
  - `npx` — one-shot: `npx bentopdf-sh report.docx`
  - `npm` — global install: `npm install -g bentopdf-sh`
- CTA buttons: "Get Started →" (indigo primary) + "GitHub" (secondary)

### Section 2 — Features
Four feature cards:
1. **Private by default** — runs entirely in-process, nothing leaves your machine
2. **WASM-powered** — same engines as the BentoPDF web app, driven from Node.js
3. **15+ formats** — DOCX, PPTX, XLSX, PDF, Markdown, HTML, images and more
4. **AI-native** — first-class Claude Code skill, one command to install

### Section 3 — Supported Formats
Compact badge grid grouped by category (no large table):
- **Office:** DOCX, XLSX, PPTX, ODT, ODS, ODP, RTF
- **Documents:** PDF (merge/convert), Markdown, HTML
- **Images:** PNG, JPEG, SVG (via mupdf)

### Section 4 — Quick Start
Three numbered steps:
1. **Install** — `npm install -g bentopdf-sh`
2. **Convert** — `bentopdf report.docx` or `bentopdf *.png merged.pdf`
3. **Add to Claude Code** — `npx skills add lokkju/bentopdf-sh -a claude-code`

### Section 5 — Footer
- Brand mark + site name
- Nav links: Getting Started, CLI Reference, Supported Formats, Claude Code, Troubleshooting, GitHub
- "Powered by [BentoPDF](https://bentopdf.com)" attribution
- AGPL-3.0 license link
- "Built with ♥ by lokkju"

---

## Docs Site (`src/content/docs/`)

### Sidebar Structure
```
Start Here
  └─ Getting Started        (docs/getting-started.mdx)
Reference
  ├─ CLI Reference           (docs/cli-reference.mdx)
  └─ Supported Formats       (docs/supported-formats.mdx)
Integrations
  └─ Claude Code             (docs/claude-code.mdx)
Guides
  └─ Troubleshooting         (docs/troubleshooting.mdx)
```

### Page Content

**Getting Started** — Prerequisites (Node.js 18+), install via npm/npx, first conversion example, link to CLI reference.

**CLI Reference** — Full `bentopdf to-pdf` flag reference, `bentopdf cache` subcommands (list, clear), exit codes table.

**Supported Formats** — Full format table: input format, engine used (mupdf/pandoc/libreoffice), notes/limitations.

**Claude Code** — Install the skill (`npx skills add lokkju/bentopdf-sh -a claude-code`), what the skill does, example prompts, manual plugin.json install path.

**Troubleshooting** — Cache location, cache clear command, common errors (engine load failures, unsupported format), WASM memory limits.

---

## File Structure

```
bentopdf-sh/ (website branch)
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── public/
│   └── favicon.svg
└── src/
    ├── pages/
    │   └── index.astro          # Custom landing page
    ├── content/
    │   └── docs/
    │       ├── docs/
    │       │   ├── getting-started.mdx
    │       │   ├── cli-reference.mdx
    │       │   ├── supported-formats.mdx
    │       │   ├── claude-code.mdx
    │       │   └── troubleshooting.mdx
    │       └── index.mdx        # Redirects to getting-started
    ├── content.config.ts
    └── styles/
        └── custom.css
```

---

## Social / Meta

- OG image: `https://bentopdf.sh/og.png` (placeholder for now)
- Twitter card: `summary_large_image`
- Description: "WASM-powered document-to-PDF conversion for the command line. No uploads, no cloud."

---

## Deployment

Not specified yet — likely Netlify or Cloudflare Pages from the `website` branch. CI build check on PRs to `website`.
