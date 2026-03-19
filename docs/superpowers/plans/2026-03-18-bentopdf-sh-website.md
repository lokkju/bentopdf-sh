# bentopdf.sh Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and ship the bentopdf.sh marketing + docs website on an orphan `website` branch using Astro + Starlight, matching the design spec at `docs/superpowers/specs/2026-03-18-bentopdf-sh-website-design.md`.

**Architecture:** Orphan `website` branch (no CLI code — Astro site only). Custom landing page at `src/pages/index.astro` (pure HTML/CSS/vanilla JS, scroll-snap sections). Starlight docs at `src/content/docs/docs/*.mdx`. Deployed to Cloudflare Pages from the `website` branch.

**Tech Stack:** Astro 6, `@astrojs/starlight`, Google Fonts (DM Sans + JetBrains Mono), vanilla JS, no UI framework.

---

## File Map

| File | Purpose |
|------|---------|
| `astro.config.mjs` | Starlight config: site URL, sidebar, social icons, redirects, head meta |
| `package.json` | Astro + Starlight deps, build scripts |
| `tsconfig.json` | Astro TypeScript config |
| `src/content.config.ts` | Starlight content collection: docsLoader + docsSchema |
| `src/styles/custom.css` | Starlight accent/font overrides (indigo palette, DM Sans) |
| `src/pages/index.astro` | Full landing page (hero, features, formats, quickstart, footer) |
| `public/favicon.svg` | Site favicon (simple PDF icon in indigo) |
| `public/og.png` | OG image placeholder (1200×630, add real image before launch) |
| `src/content/docs/docs/getting-started.mdx` | Install, first conversion, prerequisites |
| `src/content/docs/docs/cli-reference.mdx` | to-pdf flags, cache subcommands, exit codes |
| `src/content/docs/docs/supported-formats.mdx` | Full format table with engine column |
| `src/content/docs/docs/claude-code.mdx` | npx skills add, example prompts, manual install |
| `src/content/docs/docs/troubleshooting.mdx` | Cache location, common errors, WASM limits |
| `.github/workflows/website-ci.yml` | Build check on PRs to `website` branch |

---

## Task 1: Bootstrap orphan `website` branch

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `astro.config.mjs` (minimal, to be expanded in Task 2)
- Create: `src/content.config.ts`

- [ ] **Step 1: Create orphan branch**

```bash
git fetch origin
git checkout --orphan website
git rm -rf .
```

This removes all CLI files. We're starting fresh.

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "bentopdf-sh-website",
  "type": "module",
  "version": "0.0.1",
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "@astrojs/starlight": "^0.38.1",
    "astro": "^6.0.1",
    "sharp": "^0.34.2"
  }
}
```

- [ ] **Step 3: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict"
}
```

- [ ] **Step 5: Create minimal `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://bentopdf.sh',
  integrations: [
    starlight({
      title: 'bentopdf.sh',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/lokkju/bentopdf-sh' },
        { icon: 'external', label: 'npm', href: 'https://www.npmjs.com/package/bentopdf-sh' },
      ],
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Start Here',
          items: [{ label: 'Getting Started', slug: 'docs/getting-started' }],
        },
        {
          label: 'Reference',
          items: [
            { label: 'CLI Reference', slug: 'docs/cli-reference' },
            { label: 'Supported Formats', slug: 'docs/supported-formats' },
          ],
        },
        {
          label: 'Integrations',
          items: [{ label: 'Claude Code', slug: 'docs/claude-code' }],
        },
        {
          label: 'Guides',
          items: [{ label: 'Troubleshooting', slug: 'docs/troubleshooting' }],
        },
      ],
      head: [
        { tag: 'meta', attrs: { property: 'og:image', content: 'https://bentopdf.sh/og.png' } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: 'https://bentopdf.sh/og.png' } },
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' } },
        { tag: 'link', attrs: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap' } },
      ],
    }),
  ],
  redirects: {
    '/docs/': '/docs/getting-started/',
  },
});
```

- [ ] **Step 6: Create `src/content.config.ts`**

```ts
import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};
```

- [ ] **Step 7: Create stub docs pages so build doesn't fail**

Create `src/content/docs/docs/getting-started.mdx`:
```mdx
---
title: Getting Started
---

Coming soon.
```

Create the same one-liner stub for each remaining doc page:
- `src/content/docs/docs/cli-reference.mdx` — title: `CLI Reference`
- `src/content/docs/docs/supported-formats.mdx` — title: `Supported Formats`
- `src/content/docs/docs/claude-code.mdx` — title: `Claude Code`
- `src/content/docs/docs/troubleshooting.mdx` — title: `Troubleshooting`

- [ ] **Step 8: Verify build passes**

```bash
npm run build
```

Expected: `dist/` created, exit 0. Starlight renders the stub docs. No landing page yet.

- [ ] **Step 9: Create placeholder public assets**

`public/og.png` — create a 1×1 px transparent PNG placeholder (any 1×1 PNG file works; replace before launch):

```bash
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82' > public/og.png
```

`public/favicon.svg` — a simple document-to-PDF icon in indigo `#6366f1`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6366f1">
  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-5 8v-1h8v1H8zm0-3v-1h8v1H8zm0-3V9h5v1H8z"/>
</svg>
```

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "feat: bootstrap website branch with Astro + Starlight"
```

---

## Task 2: Custom CSS (Starlight accent + font overrides)

**Files:**
- Create: `src/styles/custom.css`

- [ ] **Step 1: Create `src/styles/custom.css`**

```css
/* bentopdf.sh — Starlight accent + font overrides */

:root {
  --sl-color-accent-low:  #1e1b4b;
  --sl-color-accent:      #6366f1;
  --sl-color-accent-high: #818cf8;
  --sl-color-text-accent: #818cf8;
  --sl-font:              'DM Sans', system-ui, sans-serif;
  --sl-font-mono:         'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
}

/* Sidebar active item */
.sl-sidebar a[aria-current='page'] {
  color: var(--sl-color-accent);
  border-inline-start-color: var(--sl-color-accent);
}

/* Code blocks */
code, pre, kbd {
  font-family: var(--sl-font-mono);
}

/* Nav brand */
.site-title {
  color: var(--sl-color-accent) !important;
  font-weight: 700;
  letter-spacing: -0.02em;
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: no errors, docs pages now styled with indigo accent.

- [ ] **Step 3: Commit**

```bash
git add src/styles/custom.css
git commit -m "feat: add Starlight indigo accent and DM Sans overrides"
```

---

## Task 3: Landing page — skeleton, head, and header

**Files:**
- Create: `src/pages/index.astro`

- [ ] **Step 1: Create `src/pages/index.astro` with head and fixed header**

```astro
---
// Landing page — standalone Astro page, not a Starlight docs page
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="WASM-powered document-to-PDF conversion for the command line. No uploads, no cloud." />
  <title>bentopdf.sh — Documents to PDF. Locally.</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://bentopdf.sh/" />
  <meta property="og:title" content="bentopdf.sh — Documents to PDF. Locally." />
  <meta property="og:description" content="WASM-powered document-to-PDF conversion for the command line. No uploads, no cloud." />
  <meta property="og:image" content="https://bentopdf.sh/og.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="https://bentopdf.sh/og.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:        #111827;
      --bg-card:   #1f2937;
      --bg-alt:    #161d2e;
      --indigo:    #6366f1;
      --indigo-hi: #818cf8;
      --text:      #e5e7eb;
      --text-dim:  #9ca3af;
      --border:    #374151;
      --sans:      'DM Sans', system-ui, sans-serif;
      --mono:      'JetBrains Mono', 'Fira Code', monospace;
    }

    html {
      scroll-snap-type: y mandatory;
      overflow-y: scroll;
      scroll-behavior: smooth;
      background: var(--bg);
      color: var(--text);
      font-family: var(--sans);
    }

    body { min-height: 100vh; }

    /* ── Header ── */
    .site-header {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      display: flex; align-items: center; gap: 1rem;
      padding: 0 2rem; height: 56px;
      background: rgba(17, 24, 39, 0.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }
    .header-brand {
      display: flex; align-items: center; gap: 0.5rem;
      text-decoration: none; color: var(--indigo);
      font-weight: 700; font-size: 1.05rem; letter-spacing: -0.02em;
      flex-shrink: 0;
    }
    .header-brand svg { width: 20px; height: 20px; fill: var(--indigo); }
    .header-nav { display: flex; align-items: center; gap: 0.25rem; }
    .header-nav a {
      color: var(--text-dim); text-decoration: none; font-size: 0.9rem;
      padding: 0.25rem 0.6rem; border-radius: 4px;
      transition: color 0.15s, background 0.15s;
    }
    .header-nav a:hover { color: var(--text); background: var(--bg-card); }
    .header-nav a.active { color: var(--indigo); }
    .header-spacer { flex: 1; }
    .header-actions { display: flex; align-items: center; gap: 0.75rem; }
    .header-actions a {
      color: var(--text-dim); text-decoration: none;
      display: flex; align-items: center; gap: 0.35rem;
      font-size: 0.875rem; padding: 0.25rem 0.5rem; border-radius: 4px;
      transition: color 0.15s;
    }
    .header-actions a:hover { color: var(--text); }
    .header-actions svg { width: 18px; height: 18px; fill: currentColor; }

    /* ── Snap sections ── */
    .snap-section {
      scroll-snap-align: start; min-height: 100vh;
      display: flex; flex-direction: column;
      justify-content: center; align-items: center;
      padding: 5rem 2rem 3rem; position: relative;
    }

    /* ── Shared typography ── */
    .section-label {
      font-family: var(--mono); font-size: 0.7rem;
      letter-spacing: 0.12em; text-transform: uppercase;
      color: var(--indigo); margin-bottom: 0.75rem;
    }
    .section-title {
      font-size: clamp(1.6rem, 3.5vw, 2.5rem); font-weight: 700;
      letter-spacing: -0.03em; line-height: 1.15; margin-bottom: 1rem;
    }
    .section-subtitle {
      font-size: 1rem; color: var(--text-dim);
      max-width: 520px; line-height: 1.6;
      margin-bottom: 3rem; text-align: center;
    }

    /* ── Buttons ── */
    .btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.65rem 1.5rem; border-radius: 6px;
      font-size: 0.95rem; font-weight: 600; text-decoration: none;
      transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
      cursor: pointer; border: none; font-family: var(--sans);
    }
    .btn svg { width: 16px; height: 16px; fill: currentColor; flex-shrink: 0; }
    .btn-primary {
      background: var(--indigo); color: #fff;
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
    }
    .btn-primary:hover {
      background: #818cf8; transform: translateY(-1px);
      box-shadow: 0 6px 28px rgba(99, 102, 241, 0.55);
    }
    .btn-secondary {
      background: var(--bg-card); color: var(--text);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover {
      background: var(--bg-alt); border-color: var(--indigo);
      transform: translateY(-1px);
    }
    .cta-buttons {
      display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;
    }

    /* ── Responsive ── */
    @media (max-width: 640px) {
      .site-header { padding: 0 1rem; }
      .snap-section { padding: 5rem 1rem 2rem; }
    }
  </style>
</head>
<body>

  <header class="site-header">
    <a href="/" class="header-brand">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-5 8v-1h8v1H8zm0-3v-1h8v1H8zm0-3V9h5v1H8z"/>
      </svg>
      bentopdf.sh
    </a>
    <nav class="header-nav">
      <a href="/" class="active">Home</a>
      <a href="/docs/getting-started/">Docs</a>
    </nav>
    <div class="header-spacer"></div>
    <div class="header-actions">
      <a href="https://github.com/lokkju/bentopdf-sh" target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" aria-label="GitHub">
          <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.021C22 6.484 17.522 2 12 2z"/>
        </svg>
        GitHub
      </a>
    </div>
  </header>

  <!-- Sections added in Tasks 4–7 -->

</body>
</html>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: exit 0. Landing page at `/` renders (blank body aside from header).

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add landing page skeleton with header and CSS vars"
```

---

## Task 4: Landing page — Hero section

**Files:**
- Modify: `src/pages/index.astro`

Add these CSS rules inside the `<style>` block (before the `@media` rule) and the Hero HTML before `<!-- Sections added in Tasks 4–7 -->`.

- [ ] **Step 1: Add hero CSS inside `<style>`**

```css
/* ── Hero ── */
.hero {
  background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99, 102, 241, 0.18) 0%, transparent 70%),
              var(--bg);
  text-align: center;
}
.hero-eyebrow {
  display: inline-block; font-family: var(--mono); font-size: 0.75rem;
  color: var(--indigo); background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 100px;
  padding: 0.25rem 0.85rem; letter-spacing: 0.06em;
  text-transform: uppercase; margin-bottom: 1.5rem;
}
.hero-title {
  font-size: clamp(3rem, 8vw, 6rem); font-weight: 700;
  letter-spacing: -0.04em; line-height: 1; margin-bottom: 1rem;
  background: linear-gradient(135deg, #ffffff 30%, var(--indigo-hi) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-tagline {
  font-size: clamp(1rem, 2.5vw, 1.25rem); color: var(--text-dim);
  margin-bottom: 2.5rem; max-width: 460px; line-height: 1.55;
}

/* ── Install tabs ── */
.install-tabs { width: 100%; max-width: 480px; margin-bottom: 2.5rem; }
.tab-buttons { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 0; }
.tab-btn {
  font-family: var(--mono); font-size: 0.85rem; color: var(--text-dim);
  background: none; border: none; border-bottom: 2px solid transparent;
  padding: 0.6rem 1.2rem; cursor: pointer;
  transition: color 0.15s, border-color 0.15s; margin-bottom: -1px;
}
.tab-btn:hover { color: var(--text); }
.tab-btn.active { color: var(--indigo); border-bottom-color: var(--indigo); }
.tab-panels {
  background: var(--bg-card); border: 1px solid var(--border);
  border-top: none; border-radius: 0 0 8px 8px;
}
.tab-panel { display: none; padding: 1rem 1.25rem; }
.tab-panel.active { display: block; }
.tab-panel pre { font-family: var(--mono); font-size: 0.88rem; color: var(--text); white-space: pre; overflow-x: auto; text-align: left; }
.tab-panel .cmd-prefix { color: var(--text-dim); user-select: none; }
```

- [ ] **Step 2: Add hero HTML (replace `<!-- Sections added in Tasks 4–7 -->` comment)**

```html
  <!-- Hero -->
  <section class="snap-section hero">
    <span class="hero-eyebrow">bentopdf.sh</span>
    <h1 class="hero-title">Documents to PDF.<br>Locally.</h1>
    <p class="hero-tagline">WASM-powered conversion — no uploads, no cloud, no dependencies.</p>

    <div class="install-tabs">
      <div class="tab-buttons">
        <button class="tab-btn active" data-tab="npx">npx</button>
        <button class="tab-btn" data-tab="npm">npm</button>
      </div>
      <div class="tab-panels">
        <div class="tab-panel active" id="tab-npx">
          <pre><span class="cmd-prefix">$ </span>npx bentopdf-sh to-pdf report.docx</pre>
        </div>
        <div class="tab-panel" id="tab-npm">
          <pre><span class="cmd-prefix">$ </span>npm install -g bentopdf-sh
<span class="cmd-prefix">$ </span>bentopdf to-pdf report.docx</pre>
        </div>
      </div>
    </div>

    <div class="cta-buttons">
      <a href="/docs/getting-started/" class="btn btn-primary">
        <svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
        Get Started
      </a>
      <a href="https://github.com/lokkju/bentopdf-sh" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.021C22 6.484 17.522 2 12 2z"/></svg>
        GitHub
      </a>
    </div>
  </section>

  <!-- Tasks 5–7 sections go here -->

  <script>
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = document.getElementById('tab-' + target);
        if (panel) panel.classList.add('active');
      });
    });
  </script>

</body>
</html>
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add hero section with install tabs and CTA buttons"
```

---

## Task 5: Landing page — Features section

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Add features CSS inside `<style>` (before `@media`)**

```css
/* ── Features ── */
.features { background: var(--bg-alt); }
.features-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem; width: 100%; max-width: 900px;
}
.feature-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 10px; padding: 2rem;
  transition: border-color 0.2s, transform 0.2s;
}
.feature-card:hover { border-color: var(--indigo); transform: translateY(-2px); }
.feature-icon {
  width: 44px; height: 44px;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 10px; display: flex; align-items: center;
  justify-content: center; margin-bottom: 1.25rem;
}
.feature-icon svg { width: 22px; height: 22px; fill: var(--indigo-hi); }
.feature-title { font-size: 1.05rem; font-weight: 600; color: var(--text); margin-bottom: 0.6rem; letter-spacing: -0.01em; }
.feature-desc { font-size: 0.9rem; color: var(--text-dim); line-height: 1.65; }

@media (max-width: 640px) {
  .features-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: Add features HTML (replace `<!-- Tasks 5–7 sections go here -->` comment)**

```html
  <!-- Features -->
  <section class="snap-section features">
    <p class="section-label">Features</p>
    <h2 class="section-title">Everything you need, nothing you don't.</h2>
    <p class="section-subtitle">The same WASM engines that power BentoPDF in the browser, now driven from your terminal.</p>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
        </div>
        <h3 class="feature-title">Private by default</h3>
        <p class="feature-desc">Runs entirely in-process using WASM. Nothing leaves your machine — no uploads, no cloud calls, no telemetry.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>
        </div>
        <h3 class="feature-title">WASM-powered</h3>
        <p class="feature-desc">Same engines as BentoPDF: LibreOffice WASM, MuPDF, and pandoc-wasm — battle-tested in production, now on the CLI.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24"><path d="M20 6h-2.18c.07-.44.18-.87.18-1.33C18 2.54 15.96.5 13.5.5c-1.3 0-2.43.52-3.27 1.36L9 3.08 7.77 1.86C6.93.52 5.8 0 4.5 0 2.04 0 0 2.04 0 4.5c0 .46.11.89.18 1.33H0v2h20c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-5H0v5c0 2.21 1.79 4 4 4h16c2.21 0 4-1.79 4-4V10c0-2.21-1.79-4-4-4z"/></svg>
        </div>
        <h3 class="feature-title">15+ formats</h3>
        <p class="feature-desc">DOCX, PPTX, XLSX, ODT, RTF, Markdown, HTML, PNG, JPEG, SVG, TIFF, WebP — single command, automatic engine selection.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
        </div>
        <h3 class="feature-title">AI-native</h3>
        <p class="feature-desc">First-class Claude Code skill. One command to install — then just ask Claude to convert your files.</p>
      </div>
    </div>
  </section>

  <!-- Tasks 6–7 sections go here -->
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add features section with four cards"
```

---

## Task 6: Landing page — Supported Formats + Quick Start sections

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Add formats + quickstart CSS inside `<style>` (before `@media`)**

```css
/* ── Formats ── */
.formats { background: var(--bg); }
.format-groups {
  display: flex; flex-direction: column; gap: 1.5rem;
  width: 100%; max-width: 720px;
}
.format-group-label {
  font-family: var(--mono); font-size: 0.75rem; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--text-dim); margin-bottom: 0.6rem;
}
.format-badges { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.badge {
  font-family: var(--mono); font-size: 0.78rem; font-weight: 600;
  color: var(--indigo-hi); background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 6px; padding: 0.3rem 0.65rem;
  letter-spacing: 0.04em; text-transform: uppercase;
}

/* ── Quick Start ── */
.quickstart { background: var(--bg-alt); }
.steps { display: flex; flex-direction: column; gap: 1rem; width: 100%; max-width: 640px; }
.step {
  display: grid; grid-template-columns: 44px 1fr;
  gap: 1.25rem; align-items: start;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 10px; padding: 1.5rem;
}
.step-number {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.3);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--mono); font-size: 0.85rem; font-weight: 600;
  color: var(--indigo); flex-shrink: 0;
}
.step-title { font-size: 0.95rem; font-weight: 600; color: var(--text); margin-bottom: 0.4rem; }
.step-desc { font-size: 0.875rem; color: var(--text-dim); line-height: 1.6; margin-bottom: 0.75rem; }
.step-code {
  font-family: var(--mono); font-size: 0.82rem; color: var(--text);
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 6px; padding: 0.6rem 0.85rem;
  overflow-x: auto; white-space: pre;
}
.step-code .cmd-prefix { color: var(--text-dim); user-select: none; }
```

- [ ] **Step 2: Add formats + quickstart HTML (replace `<!-- Tasks 6–7 sections go here -->` comment)**

```html
  <!-- Supported Formats -->
  <section class="snap-section formats">
    <p class="section-label">Formats</p>
    <h2 class="section-title">One command, any format.</h2>
    <p class="section-subtitle">bentopdf automatically picks the right WASM engine based on your input file extension.</p>
    <div class="format-groups">
      <div>
        <p class="format-group-label">Office Documents</p>
        <div class="format-badges">
          <span class="badge">DOCX</span><span class="badge">DOC</span>
          <span class="badge">PPTX</span><span class="badge">PPT</span>
          <span class="badge">XLSX</span><span class="badge">XLS</span>
          <span class="badge">ODT</span><span class="badge">ODS</span>
          <span class="badge">ODP</span><span class="badge">RTF</span>
        </div>
      </div>
      <div>
        <p class="format-group-label">Web &amp; Documents</p>
        <div class="format-badges">
          <span class="badge">Markdown</span><span class="badge">HTML</span><span class="badge">HTM</span>
        </div>
      </div>
      <div>
        <p class="format-group-label">Images</p>
        <div class="format-badges">
          <span class="badge">PNG</span><span class="badge">JPEG</span><span class="badge">SVG</span>
          <span class="badge">TIFF</span><span class="badge">WebP</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Quick Start -->
  <section class="snap-section quickstart">
    <p class="section-label">Quick Start</p>
    <h2 class="section-title">Up in three steps.</h2>
    <p class="section-subtitle">No daemon, no config file required — just install and convert.</p>
    <div class="steps">
      <div class="step">
        <div class="step-number">1</div>
        <div>
          <p class="step-title">Install</p>
          <p class="step-desc">Install globally via npm. Requires Node.js 18+. WASM engines are downloaded on first use and cached in <code>~/.cache/bentopdf/</code>.</p>
          <pre class="step-code"><span class="cmd-prefix">$ </span>npm install -g bentopdf-sh</pre>
        </div>
      </div>
      <div class="step">
        <div class="step-number">2</div>
        <div>
          <p class="step-title">Convert</p>
          <p class="step-desc">Pass one or more files. bentopdf picks the right engine automatically. Output defaults to the same directory as input.</p>
          <pre class="step-code"><span class="cmd-prefix">$ </span>bentopdf to-pdf report.docx slides.pptx</pre>
        </div>
      </div>
      <div class="step">
        <div class="step-number">3</div>
        <div>
          <p class="step-title">Add to Claude Code</p>
          <p class="step-desc">Install the Claude Code skill. Then just ask Claude to convert your files — it uses bentopdf under the hood.</p>
          <pre class="step-code"><span class="cmd-prefix">$ </span>npx skills add lokkju/bentopdf-sh -a claude-code</pre>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer (Task 7) -->
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add supported formats and quick start sections"
```

---

## Task 7: Landing page — Footer

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Add footer CSS inside `<style>` (before `@media`)**

```css
/* ── Footer ── */
.site-footer {
  background: var(--bg); border-top: 1px solid var(--border);
  padding: 2.5rem 2rem; display: flex; flex-direction: column;
  align-items: center; gap: 1.25rem; text-align: center;
}
.footer-brand {
  display: flex; align-items: center; gap: 0.5rem;
  color: var(--indigo); font-weight: 700; font-size: 1rem; letter-spacing: -0.02em;
}
.footer-brand svg { width: 18px; height: 18px; fill: var(--indigo); }
.footer-links { display: flex; gap: 1.5rem; flex-wrap: wrap; justify-content: center; }
.footer-links a {
  color: var(--text-dim); text-decoration: none;
  font-size: 0.875rem; transition: color 0.15s;
}
.footer-links a:hover { color: var(--text); }
.footer-copy { font-size: 0.8rem; color: var(--text-dim); }
.footer-copy a { color: var(--text-dim); text-decoration: underline; }
.footer-copy a:hover { color: var(--text); }
```

- [ ] **Step 2: Add footer HTML (replace `<!-- Footer (Task 7) -->` comment)**

```html
  <footer class="site-footer">
    <div class="footer-brand">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-5 8v-1h8v1H8zm0-3v-1h8v1H8zm0-3V9h5v1H8z"/>
      </svg>
      bentopdf.sh
    </div>
    <nav class="footer-links">
      <a href="/docs/getting-started/">Getting Started</a>
      <a href="/docs/cli-reference/">CLI Reference</a>
      <a href="/docs/supported-formats/">Supported Formats</a>
      <a href="/docs/claude-code/">Claude Code</a>
      <a href="/docs/troubleshooting/">Troubleshooting</a>
      <a href="https://github.com/lokkju/bentopdf-sh" target="_blank" rel="noopener noreferrer">GitHub</a>
      <a href="https://www.npmjs.com/package/bentopdf-sh" target="_blank" rel="noopener noreferrer">npm</a>
    </nav>
    <p class="footer-copy">
      Powered by <a href="https://bentopdf.com" target="_blank" rel="noopener noreferrer">BentoPDF</a>
      &nbsp;&middot;&nbsp;
      <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener noreferrer">AGPL-3.0</a>
      &nbsp;&middot;&nbsp;
      Built with <svg viewBox="0 0 16 16" style="display:inline;width:14px;height:14px;fill:#e03e6a;vertical-align:-2px;" aria-label="love"><path d="M4.25 2.5c-1.336 0-2.75 1.164-2.75 3 0 2.15 1.58 4.144 3.365 5.682A20.6 20.6 0 0 0 8 13.393a20.6 20.6 0 0 0 3.135-2.211C12.92 9.644 14.5 7.65 14.5 5.5c0-1.836-1.414-3-2.75-3-1.373 0-2.609.986-3.029 2.456a.75.75 0 0 1-1.442 0C6.859 3.486 5.623 2.5 4.25 2.5Z"/></svg>
      by <a href="https://github.com/lokkju" target="_blank" rel="noopener noreferrer">lokkju</a>
    </p>
  </footer>
```

- [ ] **Step 3: Final build verification**

```bash
npm run build
```

Expected: exit 0. Landing page is complete.

- [ ] **Step 4: Smoke test locally**

```bash
npm run dev
```

Open `http://localhost:4321` — verify all four snap sections scroll correctly, tabs switch, CTA buttons have correct hrefs, footer links point to the right docs URLs.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add footer — landing page complete"
```

---

## Task 8: Docs — Getting Started page

**Files:**
- Modify: `src/content/docs/docs/getting-started.mdx`

- [ ] **Step 1: Replace stub with full content**

```mdx
---
title: Getting Started
description: Install bentopdf-sh and convert your first document to PDF.
---

import { Tabs, TabItem } from '@astrojs/starlight/components';

## Prerequisites

- **Node.js 18+** — check with `node --version`
- npm 9+ (comes with Node.js)

WASM engines are downloaded on first use and cached at `~/.cache/bentopdf/`. An internet connection is required the first time each engine is used; after that it works fully offline.

## Installation

<Tabs>
  <TabItem label="npm (global)">
    ```bash
    npm install -g bentopdf-sh
    ```
    This makes the `bentopdf` command available globally.
  </TabItem>
  <TabItem label="npx (one-shot)">
    ```bash
    npx bentopdf-sh to-pdf report.docx
    ```
    No installation required. Slower on first run while npm fetches the package.
  </TabItem>
</Tabs>

## Your first conversion

Convert a Word document to PDF:

```bash
bentopdf to-pdf report.docx
```

Output: `report.pdf` in the same directory as the input.

Convert multiple files at once:

```bash
bentopdf to-pdf slides.pptx notes.md screenshot.png
```

Each file is converted independently. Failures are reported at the end; successful conversions are not affected by other files failing.

## Specify an output location

Write to a specific file:

```bash
bentopdf to-pdf report.docx --output ~/Desktop/report.pdf
```

Write to a directory (multiple inputs):

```bash
bentopdf to-pdf *.docx --output ./pdfs/
```

## Next steps

- [CLI Reference](/docs/cli-reference/) — all flags and subcommands
- [Supported Formats](/docs/supported-formats/) — which engine handles which format
- [Claude Code](/docs/claude-code/) — use bentopdf from within Claude
- [Troubleshooting](/docs/troubleshooting/) — cache management and common errors
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: exit 0, no mdx errors.

- [ ] **Step 3: Commit**

```bash
git add src/content/docs/docs/getting-started.mdx
git commit -m "docs: add getting started page"
```

---

## Task 9: Docs — CLI Reference page

**Files:**
- Modify: `src/content/docs/docs/cli-reference.mdx`

- [ ] **Step 1: Replace stub with full content**

```mdx
---
title: CLI Reference
description: Complete reference for all bentopdf commands, flags, and exit codes.
---

## Invocation

If installed globally (`npm install -g bentopdf-sh`):

```bash
bentopdf <command> [options]
```

If using npx:

```bash
npx bentopdf-sh <command> [options]
```

All examples below use the short `bentopdf` form.

---

## `bentopdf to-pdf`

Convert one or more files to PDF.

```bash
bentopdf to-pdf <input...> [options]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `<input...>` | One or more input file paths. Glob patterns are expanded by your shell. |

### Options

| Flag | Alias | Type | Default | Description |
|------|-------|------|---------|-------------|
| `--output` | `-o` | string | — | Output file path (single input) or directory path (multiple inputs). Defaults to same directory as input, same filename with `.pdf` extension. |
| `--engine` | — | string | auto | Force a specific engine: `mupdf`, `pandoc`, or `libreoffice`. By default bentopdf selects the engine based on file extension. |
| `--verbose` | — | boolean | `false` | Show detailed progress output including engine load time and conversion duration. |
| `--overwrite` | — | boolean | `false` | Overwrite existing output files without prompting. |

### Examples

```bash
# Single file, default output location
bentopdf to-pdf report.docx

# Single file, explicit output path
bentopdf to-pdf report.docx -o ~/Desktop/report.pdf

# Multiple files to a directory
bentopdf to-pdf *.pptx -o ./pdfs/

# Force LibreOffice engine
bentopdf to-pdf notes.html --engine libreoffice

# Verbose output
bentopdf to-pdf large-doc.docx --verbose
```

---

## `bentopdf cache`

Manage the WASM engine cache.

```bash
bentopdf cache <action>
```

### Actions

| Action | Description |
|--------|-------------|
| `list` | List all cached engines with their version, size, and cache path. |
| `clear` | Delete all cached engines. They will be re-downloaded on next use. |

### Examples

```bash
# See what's cached
bentopdf cache list

# Free up disk space
bentopdf cache clear
```

Cache location: `~/.cache/bentopdf/engines/<name>/<version>/`

---

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | All conversions succeeded. |
| `1` | One or more conversions failed (file not found, unsupported format, engine error). |
| `2` | Bad arguments (missing required input, conflicting flags). |
| `3` | Engine download failed (network error while fetching WASM binary). |
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/content/docs/docs/cli-reference.mdx
git commit -m "docs: add CLI reference page"
```

---

## Task 10: Docs — Supported Formats page

**Files:**
- Modify: `src/content/docs/docs/supported-formats.mdx`

- [ ] **Step 1: Replace stub with full content**

```mdx
---
title: Supported Formats
description: All input formats supported by bentopdf and which WASM engine handles each one.
---

bentopdf selects the conversion engine automatically based on the input file extension. You can override this with `--engine`.

## Format table

| Extension | Format | Engine | Notes |
|-----------|--------|--------|-------|
| `.docx` | Word Document | LibreOffice WASM | |
| `.doc` | Word 97–2003 | LibreOffice WASM | |
| `.pptx` | PowerPoint | LibreOffice WASM | |
| `.ppt` | PowerPoint 97–2003 | LibreOffice WASM | |
| `.xlsx` | Excel | LibreOffice WASM | |
| `.xls` | Excel 97–2003 | LibreOffice WASM | |
| `.odt` | OpenDocument Text | LibreOffice WASM | |
| `.ods` | OpenDocument Spreadsheet | LibreOffice WASM | |
| `.odp` | OpenDocument Presentation | LibreOffice WASM | |
| `.rtf` | Rich Text Format | LibreOffice WASM | |
| `.md` / `.markdown` | Markdown | pandoc-wasm → MuPDF | Two-stage: pandoc renders HTML, MuPDF renders to PDF |
| `.html` / `.htm` | HTML | pandoc-wasm → MuPDF | Two-stage pipeline |
| `.png` | PNG Image | MuPDF | |
| `.jpg` / `.jpeg` | JPEG Image | MuPDF | |
| `.svg` | SVG | MuPDF | |
| `.tiff` / `.tif` | TIFF Image | MuPDF | |
| `.webp` | WebP Image | MuPDF | |

## Engines

### LibreOffice WASM
Handles Office and OpenDocument formats via `@matbee/libreoffice-converter`. The WASM binary (~80 MB) is downloaded on first use and cached. Supports the full LibreOffice filter set.

### MuPDF
Handles images and acts as the PDF renderer in the pandoc pipeline via the `mupdf` npm package. Fast, lightweight, no network download required (ships as a native Node.js addon).

### pandoc-wasm
Converts Markdown and HTML to an intermediate HTML representation, then passes it to MuPDF for PDF rendering. Handles tables, code blocks, and most CommonMark extensions.

## Unsupported formats

If you pass a file with an unrecognised extension, bentopdf exits with code `1` and prints:

```
Error: no engine registered for extension ".xyz"
```

Use `--engine` to force an engine if you know the file format is compatible:

```bash
bentopdf to-pdf notes.txt --engine pandoc
```
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/content/docs/docs/supported-formats.mdx
git commit -m "docs: add supported formats page"
```

---

## Task 11: Docs — Claude Code integration page

**Files:**
- Modify: `src/content/docs/docs/claude-code.mdx`

- [ ] **Step 1: Replace stub with full content**

```mdx
---
title: Claude Code
description: Install the bentopdf Claude Code skill and use it from within Claude.
---

import { Aside } from '@astrojs/starlight/components';

bentopdf ships a first-class Claude Code skill. Once installed, you can ask Claude to convert files to PDF and it will use `bentopdf` under the hood.

## Install the skill

The fastest way is via the `skills` CLI:

```bash
npx skills add lokkju/bentopdf-sh -a claude-code
```

This clones the skill from the `skills/to-pdf/` directory in this repository into your Claude Code skills directory (`~/.claude/skills/to-pdf/`).

<Aside type="note">
The `skills` CLI is part of the [Vercel open agent skills](https://github.com/vercel/agent-skills) ecosystem. The `-a claude-code` flag installs it specifically for Claude Code.
</Aside>

## Manual install (plugin)

Alternatively, install the full Claude Code plugin, which includes the skill plus plugin metadata:

```bash
# Copy the plugin directory into your Claude plugins folder
cp -r .claude-plugin ~/.claude/plugins/bentopdf
```

Or add it to your project's `.claude/` directory for project-scoped access.

## What the skill does

When active, Claude will recognise requests like:

- "Convert report.docx to PDF"
- "Turn these slides into a PDF"
- "Make a PDF from all the markdown files in this directory"

Claude translates those into `bentopdf to-pdf` commands and runs them in your terminal.

## Example prompts

```
Convert the file at ~/Downloads/quarterly-report.docx to PDF and put it on my Desktop.
```

```
Convert all the .md files in ./docs to PDF, output them to ./pdfs/.
```

```
I have a bunch of screenshots in ./screenshots — merge them into a single PDF.
```

## Trigger phrases

The skill activates on any of:
- "convert * to pdf" / "make * a pdf"
- "export * as pdf"
- "pdf from *"
- Anything involving `bentopdf` directly

## Availability check

The skill checks that `bentopdf` is available before running. If not found, it suggests installing via `npm install -g bentopdf-sh`.
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/content/docs/docs/claude-code.mdx
git commit -m "docs: add Claude Code integration page"
```

---

## Task 12: Docs — Troubleshooting page

**Files:**
- Modify: `src/content/docs/docs/troubleshooting.mdx`

- [ ] **Step 1: Replace stub with full content**

```mdx
---
title: Troubleshooting
description: Common errors, cache management, and WASM memory limits.
---

import { Aside } from '@astrojs/starlight/components';

## Cache management

WASM engine binaries are cached at:

```
~/.cache/bentopdf/engines/<engine-name>/<version>/
```

### List cached engines

```bash
bentopdf cache list
```

Output example:
```
libreoffice@2.6.0  83.2 MB  ~/.cache/bentopdf/engines/libreoffice/2.6.0/
```

### Clear the cache

```bash
bentopdf cache clear
```

This deletes all cached binaries. They will be re-downloaded on next use. Use this if an engine is corrupted or you want to free up disk space.

---

## Common errors

### `Error: no engine registered for extension ".xyz"`

The file extension is not in bentopdf's format registry. Either the format is unsupported, or the file has the wrong extension.

**Fix:** Check [Supported Formats](/docs/supported-formats/). If the format is compatible with an existing engine, use `--engine` to force it:

```bash
bentopdf to-pdf notes.txt --engine pandoc
```

### `Error: engine download failed`

The WASM binary could not be downloaded (network error, corporate proxy, or npm registry issue).

**Fix:**
1. Check your internet connection and proxy settings.
2. Try running with `npm config set registry https://registry.npmjs.org` if behind a custom registry.
3. Try `npx bentopdf-sh` instead of global install — npx handles resolution differently.

Exit code: `3`

### `Error: Cannot use a single filename output for multiple inputs`

You passed `--output report.pdf` with multiple input files. A filename output only works with a single input.

**Fix:** Pass a directory instead:

```bash
bentopdf to-pdf *.docx --output ./pdfs/
```

### LibreOffice WASM crashes / runs out of memory

LibreOffice WASM requires significant memory (~500 MB) for large Office documents.

**Fix:**
- Increase Node.js memory limit: `NODE_OPTIONS=--max-old-space-size=2048 bentopdf to-pdf large.docx`
- Convert large files one at a time rather than in batch.

<Aside type="tip">
If you regularly convert large Office files, `npm install -g bentopdf-sh` (global install) is faster than `npx` because it avoids re-resolving the package on each run.
</Aside>

---

## Getting help

- [GitHub Issues](https://github.com/lokkju/bentopdf-sh/issues) — bug reports and feature requests
- [CLI Reference](/docs/cli-reference/) — full flag documentation
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/content/docs/docs/troubleshooting.mdx
git commit -m "docs: add troubleshooting page"
```

---

## Task 13: CI workflow for website branch

**Files:**
- Create: `.github/workflows/website-ci.yml`

- [ ] **Step 1: Create workflow file**

```yaml
name: Website CI

on:
  push:
    branches: [website]
  pull_request:
    branches: [website]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
```

- [ ] **Step 2: Verify build one last time**

```bash
npm run build
```

Expected: exit 0, clean `dist/` output.

- [ ] **Step 3: Commit and push**

```bash
git add .github/workflows/website-ci.yml
git commit -m "ci: add website build check workflow"
git push -u origin website
```

Expected: branch pushed to GitHub, CI workflow runs automatically.

---

## Done

The website is built and pushed. Next steps outside this plan:
1. Connect the `website` branch to Cloudflare Pages (project name: `bentopdf-sh`, build command: `npm run build`, output: `dist/`)
2. Add a real 1200×630 OG image to `public/og.png`
3. Point the `bentopdf.sh` domain DNS to Cloudflare Pages
