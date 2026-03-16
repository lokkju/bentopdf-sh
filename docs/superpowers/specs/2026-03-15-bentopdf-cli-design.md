# bentopdf-cli Design Spec

## Overview

A Node.js CLI tool that wraps bentopdf's WASM modules to provide document conversion from the command line. The same engines that power bentopdf's browser-based toolkit (LibreOffice-WASM, MuPDF, Pandoc-WASM) run locally via Node.js, making WASM the universal compatibility layer.

Distributed via npm. Users run `npx bentopdf-cli to-pdf doc.docx` with no setup beyond Node.js.

## Goals

- v0.1 scope: **convert to PDF** only
- Supported input formats: DOCX, PPTX, XLSX, ODT, ODS, ODP, HTML, Markdown, JPG, PNG, SVG, TIFF, WebP
- Lazy WASM engine download — fast install, engines fetched on first use
- Companion Claude Code skill for invoking conversions naturally

## Prerequisites: Feasibility Spike

Before building the CLI scaffolding, validate that each WASM engine loads and converts in Node.js:

1. **LibreOffice-WASM**: Load bentopdf's LO-WASM bundle in Node.js, convert a single DOCX to PDF. Identify any browser API dependencies (Web Workers, DOM APIs) that need shimming or replacement.
2. **MuPDF**: Load the `mupdf` npm package in Node.js, convert a single PNG to PDF.
3. **Pandoc-WASM → HTML → PDF pipeline**: Validate the two-stage approach (see Engine Pipeline below).

If any engine cannot run in Node.js, document the blocker and evaluate alternatives (e.g., minimal browser context via jsdom, alternative WASM builds, or deferring that engine to a later version).

## Architecture

```
bentopdf-cli/
├── package.json
├── bin/
│   └── bentopdf.js              # CLI entry point
├── src/
│   ├── cli.js                   # arg parsing
│   ├── registry.js              # maps file extension → WASM engine (or pipeline)
│   ├── cache.js                 # WASM module download, caching, versioning
│   ├── engines/
│   │   ├── base.js              # common engine interface
│   │   ├── libreoffice.js       # docx, pptx, xlsx, odt, ods, odp → pdf
│   │   ├── mupdf.js             # images (jpg, png, svg, tiff, webp) → pdf
│   │   └── pandoc.js            # html, markdown → pdf (two-stage pipeline)
│   └── commands/
│       └── to-pdf.js            # the to-pdf command handler
├── tests/
└── engines.json                 # pinned engine versions, download URLs, checksums
```

### Key Components

**Registry** (`src/registry.js`): Maps file extensions to engine names (or pipelines). Single source of truth for "what can we convert?"

**Cache** (`src/cache.js`): Manages `~/.cache/bentopdf/engines/<engine>/<version>/`. Handles download with progress display, extraction, version checking, and integrity verification via SHA-256 checksums. XDG Base Directory compliant.

**Engine interface** (`src/engines/base.js`): All engines implement:
```js
class Engine {
  async ensureLoaded()                          // trigger lazy download if needed
  async convert(inputPath, outputPath, options)  // run conversion
  supportedExtensions()                          // list of extensions this engine handles
}
```

**Engine-to-format mapping**:

| Engine | Input Formats | WASM Source | Approx Size |
|--------|--------------|-------------|-------------|
| LibreOffice-WASM | docx, pptx, xlsx, odt, ods, odp | bentopdf's bundled LO-WASM | ~200-400 MB |
| MuPDF (`mupdf` npm) | jpg, png, svg, tiff, webp | Artifex `mupdf` package | ~10 MB |
| Pandoc-WASM (pipeline) | html, md | pandoc-wasm + MuPDF | ~30 MB + MuPDF |

### Engine Pipeline: Pandoc-WASM

Pandoc-WASM cannot produce PDF on its own — it requires a PDF rendering backend (LaTeX, Typst, etc.) which is not bundled in the WASM build.

**Solution**: Two-stage pipeline:
1. Pandoc-WASM converts Markdown/HTML → intermediate HTML (with styling)
2. MuPDF renders the HTML → PDF

The registry maps `.md` and `.html` to this pipeline rather than a single engine. The pipeline is transparent to the user — they still just run `bentopdf to-pdf README.md`.

If the Pandoc+MuPDF pipeline proves insufficient (e.g., poor HTML rendering), an alternative is Typst-WASM which can render Markdown to PDF natively.

### Lazy Download Flow

1. User runs `bentopdf to-pdf slides.pptx`
2. Registry resolves `.pptx` → `libreoffice` engine
3. Cache checks `~/.cache/bentopdf/engines/libreoffice/<version>/`
4. If missing: downloads from source, verifies SHA-256 checksum, shows progress bar, extracts to cache
5. Engine loads WASM module into Node.js, runs conversion, writes output PDF

### Version Pinning & Integrity

`engines.json` at project root pins each engine. Example entry:

```json
{
  "libreoffice": {
    "version": "7.6.0",
    "url": "https://cdn.example.com/libreoffice-wasm-7.6.0.tar.gz",
    "sha256": "abc123...",
    "size": "350MB",
    "format": "tar.gz"
  }
}
```

Updates are explicit — bump the version in `engines.json`, users get the new engine on next invocation. Downloads are verified against the SHA-256 checksum before extraction.

## CLI Interface

### Commands

```
bentopdf to-pdf <input...> [options]

Options:
  -o, --output <path>     Output file or directory (default: input name with .pdf)
  --engine <name>         Force specific engine (override auto-detection)
  --verbose               Show detailed progress
  --version               Show version
  --help                  Show help

bentopdf cache list          Show downloaded engines and sizes
bentopdf cache clear         Remove all cached engines
bentopdf cache prefetch      Download all engines upfront
```

### Behavior

**Single file**: `bentopdf to-pdf report.docx` → `report.pdf` in same directory

**Explicit output**: `bentopdf to-pdf report.docx -o final.pdf`

**Batch**: `bentopdf to-pdf *.docx -o ./pdfs/` → multiple PDFs in `./pdfs/`

**Batch with `-o` as filename**: Error. When multiple inputs are provided, `-o` must be a directory (path ending in `/` or existing directory). Providing a single filename with multiple inputs is an argument error (exit code 2).

**Batch failure behavior**: Best-effort. All files are attempted sequentially. Failures are collected and reported in a summary at the end. Exit code is 1 if any conversion failed, 0 if all succeeded.

**`--engine` override**: Bypasses registry lookup but the engine still validates it can handle the format. If the engine does not support the format, it produces a clear error rather than attempting a likely-broken conversion.

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success (all files converted) |
| 1 | Conversion error (one or more files failed) |
| 2 | Bad arguments (invalid flags, -o conflict, etc.) |
| 3 | Engine download failure |

### Error Handling

- Unsupported format → list supported formats
- Download failure → retry once, then fail with clear instructions
- Checksum mismatch → fail, suggest `bentopdf cache clear` and retry
- Conversion failure → surface engine error, suggest `--verbose`
- Missing input → "file not found" with the path

## Claude Code Skill

A skill file at `skills/bentopdf.md` with YAML frontmatter:

```yaml
---
name: bentopdf
description: Convert documents to PDF using bentopdf-cli. Triggers on PDF conversion, document conversion, or format transformation requests.
---
```

The skill content instructs Claude to:
- Check if `bentopdf-cli` is installed (`npx bentopdf-cli --version`), install if needed
- Map user intent to the correct command (`bentopdf to-pdf <file>`)
- Handle batch patterns (glob expansion, output directories)
- Manage cache when engines need updating
- Report supported formats when asked

Trigger phrases: "convert to pdf", "docx to pdf", "make a pdf from", "pdf conversion", and similar.

## Technical Decisions

- **Pure ESM** package
- **Node.js >= 18** (stable WASM support, native fetch for downloads)
- **yargs** for CLI argument parsing
- **WASM as compatibility layer** — no native dependencies, runs anywhere Node.js runs
- **No browser required** — WASM modules loaded directly in Node.js runtime
- **SHA-256 checksums** for all downloaded WASM binaries

## Future Scope (not v0.1)

- `from-pdf` command (PDF → images, text, CSV)
- `merge` / `split` / `rotate` commands
- `ocr` command (Tesseract.js WASM)
- Piping support (stdin/stdout, `-o -`)
- Configuration file (`.bentopdfrc`)
- Parallel batch conversions with concurrency limit
