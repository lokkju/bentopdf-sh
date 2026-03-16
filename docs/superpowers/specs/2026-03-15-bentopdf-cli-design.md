# bentopdf-cli Design Spec

## Overview

A Node.js CLI tool that wraps bentopdf's WASM modules to provide document conversion from the command line. The same engines that power bentopdf's browser-based toolkit (LibreOffice-WASM, PyMuPDF, Pandoc-WASM) run locally via Node.js, making WASM the universal compatibility layer.

Distributed via npm. Users run `npx bentopdf-cli to-pdf doc.docx` with no setup beyond Node.js.

## Goals

- v0.1 scope: **convert to PDF** only
- Supported input formats: DOCX, PPTX, XLSX, ODT, ODS, ODP, HTML, Markdown, JPG, PNG, SVG, TIFF, WebP
- Lazy WASM engine download — fast install, engines fetched on first use
- Companion Claude Code skill for invoking conversions naturally

## Architecture

```
bentopdf-cli/
├── package.json
├── bin/
│   └── bentopdf.js              # CLI entry point
├── src/
│   ├── cli.js                   # arg parsing
│   ├── registry.js              # maps file extension → WASM engine
│   ├── cache.js                 # WASM module download, caching, versioning
│   ├── engines/
│   │   ├── base.js              # common engine interface
│   │   ├── libreoffice.js       # docx, pptx, xlsx, odt, ods, odp → pdf
│   │   ├── pymupdf.js           # images (jpg, png, svg, tiff, webp) → pdf
│   │   └── pandoc.js            # html, markdown → pdf
│   └── commands/
│       └── to-pdf.js            # the to-pdf command handler
├── tests/
└── engines.json                 # pinned engine versions and download URLs
```

### Key Components

**Registry** (`src/registry.js`): Maps file extensions to engine names. Single source of truth for "what can we convert?"

**Cache** (`src/cache.js`): Manages `~/.cache/bentopdf/engines/<engine>/<version>/`. Handles download with progress display, extraction, version checking. XDG Base Directory compliant.

**Engine interface** (`src/engines/base.js`): All engines implement:
```js
class Engine {
  async ensureLoaded()                          // trigger lazy download if needed
  async convert(inputPath, outputPath, options)  // run conversion
  supportedExtensions()                          // list of extensions this engine handles
}
```

**Engine-to-format mapping**:

| Engine | Input Formats | WASM Source |
|--------|--------------|-------------|
| LibreOffice-WASM | docx, pptx, xlsx, odt, ods, odp | bentopdf's bundled LibreOffice-WASM |
| PyMuPDF (MuPDF-WASM) | jpg, png, svg, tiff, webp | PyMuPDF WASM build |
| Pandoc-WASM | html, md | pandoc-wasm npm package |

### Lazy Download Flow

1. User runs `bentopdf to-pdf slides.pptx`
2. Registry resolves `.pptx` → `libreoffice` engine
3. Cache checks `~/.cache/bentopdf/engines/libreoffice/<version>/`
4. If missing: downloads from source, shows progress bar, extracts to cache
5. Engine loads WASM module into Node.js, runs conversion, writes output PDF

### Version Pinning

`engines.json` at project root pins each engine's version and download URL. Updates are explicit — bump the version in `engines.json`, users get the new engine on next invocation.

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

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Conversion error |
| 2 | Bad arguments |
| 3 | Engine download failure |

### Error Handling

- Unsupported format → list supported formats
- Download failure → retry once, then fail with clear instructions
- Conversion failure → surface engine error, suggest `--verbose`
- Missing input → "file not found" with the path

## Claude Code Skill

A skill named `bentopdf` that triggers when users mention PDF conversion, document conversion, or specific format transformations.

The skill knows:
- All supported input formats and the CLI commands to convert them
- Batch conversion patterns
- Cache management commands
- How to check if bentopdf-cli is installed and install it if not

Trigger phrases: "convert to pdf", "docx to pdf", "make a pdf from", "pdf conversion", and similar.

## Technical Decisions

- **Pure ESM** package
- **Node.js >= 18** (stable WASM support, native fetch for downloads)
- **yargs** for CLI argument parsing
- **WASM as compatibility layer** — no native dependencies, runs anywhere Node.js runs
- **No browser required** — WASM modules loaded directly in Node.js runtime

## Future Scope (not v0.1)

- `from-pdf` command (PDF → images, text, CSV)
- `merge` / `split` / `rotate` commands
- `ocr` command (Tesseract.js WASM)
- Piping support (stdin/stdout)
- Configuration file (`.bentopdfrc`)
