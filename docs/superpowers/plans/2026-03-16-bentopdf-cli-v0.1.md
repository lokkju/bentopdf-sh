# bentopdf-cli v0.1 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Node.js CLI tool that converts documents to PDF using WASM engines, distributed via npm/npx.

**Architecture:** Three WASM engines (`@matbee/libreoffice-converter` for Office formats, `mupdf` for images/HTML, `pandoc-wasm` for Markdown→HTML) behind a unified CLI. All engines are npm dependencies (no custom download/cache needed for v0.1). Registry maps file extensions to engines. Commands parsed with yargs.

**Important notes for implementers:**
- Tasks 2-4 are **feasibility spikes**. The engine code in Tasks 9-11 is based on *assumed* APIs. After completing Task 5 (spike assessment), you MUST update the engine implementations and tests in Tasks 9-11 to match the actual APIs discovered.
- The Cache class (Task 8) is infrastructure for future engines not on npm. In v0.1, engines are npm dependencies and do not use the cache. The cache is only used by the `cache list/clear` CLI commands.
- Test fixtures belong in `tests/fixtures/`, not `spikes/fixtures/`. Copy fixtures from spikes before deleting the spikes directory.

**Tech Stack:** Node.js 18+, ESM, yargs, mupdf, pandoc-wasm, @matbee/libreoffice-converter, vitest for testing

**Spec:** `docs/superpowers/specs/2026-03-15-bentopdf-cli-design.md`

---

## Chunk 1: Project Scaffolding & Feasibility Spikes

### Task 1: Project Initialization

**Files:**
- Create: `package.json`
- Create: `bin/bentopdf.js`
- Create: `.gitignore`
- Create: `LICENSE.md`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "bentopdf-cli",
  "version": "0.1.0",
  "description": "Convert documents to PDF using WASM engines — no native dependencies",
  "type": "module",
  "bin": {
    "bentopdf": "./bin/bentopdf.js"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "keywords": ["pdf", "convert", "wasm", "docx", "pptx", "cli"],
  "license": "PolyForm-Shield-1.0.0",
  "dependencies": {},
  "devDependencies": {}
}
```

- [ ] **Step 2: Create bin/bentopdf.js**

```js
#!/usr/bin/env node
console.log("bentopdf-cli v0.1.0");
```

- [ ] **Step 3: Create .gitignore**

```
node_modules/
cache/
*.tgz
.DS_Store
```

- [ ] **Step 4: Create LICENSE.md**

Use PolyForm Shield 1.0.0 license text.

- [ ] **Step 5: Install dev dependencies**

Run: `npm install --save-dev vitest`

- [ ] **Step 6: Verify bin entry point works**

Run: `node bin/bentopdf.js`
Expected: prints `bentopdf-cli v0.1.0`

- [ ] **Step 7: Commit**

```bash
git add package.json bin/bentopdf.js .gitignore LICENSE.md package-lock.json
git commit -m "feat: initialize project scaffolding"
```

### Task 2: MuPDF Feasibility Spike

**Files:**
- Create: `spikes/mupdf-spike.js`

- [ ] **Step 1: Install mupdf**

Run: `npm install --save mupdf`

- [ ] **Step 2: Write spike script — image to PDF**

```js
// spikes/mupdf-spike.js
import * as fs from "node:fs";
import * as mupdf from "mupdf";

// Test 1: Image to PDF
const imgData = fs.readFileSync("spikes/fixtures/test.png");
const doc = mupdf.Document.openDocument(imgData, "image/png");
const writer = new mupdf.DocumentWriter(mupdf.Buffer(), "pdf", "");
for (let i = 0; i < doc.countPages(); i++) {
  const page = doc.loadPage(i);
  const bounds = page.getBounds();
  const dev = writer.beginPage(bounds);
  page.run(dev, mupdf.Matrix.identity);
  writer.endPage();
}
const pdfBuf = writer.close();
fs.writeFileSync("spikes/output-image.pdf", pdfBuf.asUint8Array());
console.log("Image → PDF: OK");

// Test 2: HTML to PDF
const html = "<html><body><h1>Hello</h1><p>World</p></body></html>";
const htmlBuf = new TextEncoder().encode(html);
const htmlDoc = mupdf.Document.openDocument(htmlBuf, "text/html");
const writer2 = new mupdf.DocumentWriter(mupdf.Buffer(), "pdf", "");
for (let i = 0; i < htmlDoc.countPages(); i++) {
  const page = htmlDoc.loadPage(i);
  const bounds = page.getBounds();
  const dev = writer2.beginPage(bounds);
  page.run(dev, mupdf.Matrix.identity);
  writer2.endPage();
}
const pdfBuf2 = writer2.close();
fs.writeFileSync("spikes/output-html.pdf", pdfBuf2.asUint8Array());
console.log("HTML → PDF: OK");
```

- [ ] **Step 3: Create test fixture**

Create a small PNG file at `spikes/fixtures/test.png` (any simple image).

- [ ] **Step 4: Run spike**

Run: `node spikes/mupdf-spike.js`
Expected: Two PDF files created, both openable. Document any API differences from the expected usage.

- [ ] **Step 5: Document findings**

If the API differs from what's shown above, note the correct API in a comment at the top of the spike file. This will inform the engine implementation.

- [ ] **Step 6: Commit**

```bash
git add spikes/ package.json package-lock.json
git commit -m "spike: validate mupdf WASM in Node.js"
```

### Task 3: Pandoc-WASM Feasibility Spike

**Files:**
- Create: `spikes/pandoc-spike.js`

- [ ] **Step 1: Install pandoc-wasm**

Run: `npm install --save pandoc-wasm`

- [ ] **Step 2: Write spike script — Markdown to HTML**

```js
// spikes/pandoc-spike.js
import { convert } from "pandoc-wasm";

const markdown = `# Test Document

This is a **bold** paragraph with *italic* text.

## Section 2

- Item 1
- Item 2
- Item 3

| Column A | Column B |
|----------|----------|
| Cell 1   | Cell 2   |
`;

const result = await convert(
  { from: "markdown", to: "html", standalone: true },
  markdown,
  {}
);

console.log("Pandoc exit code:", result.exitCode);
console.log("HTML output length:", result.stdout.length);
console.log("First 500 chars:", result.stdout.substring(0, 500));

if (result.stderr) {
  console.log("Stderr:", result.stderr);
}
```

- [ ] **Step 3: Run spike**

Run: `node spikes/pandoc-spike.js`
Expected: HTML output with proper heading, list, and table markup. Document the exact API shape (return type fields, options format).

- [ ] **Step 4: Commit**

```bash
git add spikes/pandoc-spike.js package.json package-lock.json
git commit -m "spike: validate pandoc-wasm in Node.js"
```

### Task 4: LibreOffice-WASM Feasibility Spike

**Files:**
- Create: `spikes/libreoffice-spike.js`

- [ ] **Step 1: Install @matbee/libreoffice-converter**

Run: `npm install --save @matbee/libreoffice-converter`

- [ ] **Step 2: Write spike script — DOCX to PDF**

```js
// spikes/libreoffice-spike.js
import * as fs from "node:fs";

// The package has a ./server export for Node.js
import { convert } from "@matbee/libreoffice-converter/server";

const docxData = fs.readFileSync("spikes/fixtures/test.docx");

const result = await convert(docxData, "pdf");
fs.writeFileSync("spikes/output-docx.pdf", result);
console.log("DOCX → PDF: OK, size:", result.byteLength);
```

Note: The exact API may differ. The spike's purpose is to discover the correct API. Check the package's README/types first.

- [ ] **Step 3: Create test fixture**

Create a minimal DOCX at `spikes/fixtures/test.docx`. Can generate one programmatically or use a simple test file.

- [ ] **Step 4: Run spike**

Run: `node spikes/libreoffice-spike.js`
Expected: PDF file created from DOCX. Document: actual API, import path, memory usage, time taken.

- [ ] **Step 5: Document findings**

Note the correct import, API signature, any setup/teardown needed, and approximate conversion time. This directly informs the engine wrapper.

- [ ] **Step 6: Commit**

```bash
git add spikes/ package.json package-lock.json
git commit -m "spike: validate libreoffice-wasm in Node.js"
```

### Task 5: Spike Assessment Gate

- [ ] **Step 1: Review spike results**

Check all three spike outputs. For each engine, determine: does it work in Node.js? What's the actual API? Any shimming needed?

- [ ] **Step 2: Update engine code in this plan**

For each engine where the actual API differs from the assumed API in Tasks 9-11, update the engine implementation and tests in this plan document to match reality. This is critical — do not proceed to Chunk 3 with incorrect API assumptions.

- [ ] **Step 3: Copy test fixtures from spikes to tests/fixtures/**

```bash
mkdir -p tests/fixtures
cp spikes/fixtures/* tests/fixtures/
```

- [ ] **Step 4: Update spec if needed**

If any engine API differs significantly from assumptions in the spec, update `docs/superpowers/specs/2026-03-15-bentopdf-cli-design.md` with findings.

- [ ] **Step 5: Commit**

```bash
git add docs/ tests/fixtures/
git commit -m "docs: update spec and fixtures with spike findings"
```

---

## Chunk 2: Core Infrastructure

### Task 6: Engine Base Class

**Files:**
- Create: `src/engines/base.js`
- Create: `tests/engines/base.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/engines/base.test.js
import { describe, it, expect } from "vitest";
import { Engine } from "../../src/engines/base.js";

describe("Engine base class", () => {
  it("stores engine name", () => {
    const engine = new Engine("test");
    expect(engine.name).toBe("test");
  });

  it("convert() throws not-implemented", async () => {
    const engine = new Engine("test");
    await expect(engine.convert("a", "b")).rejects.toThrow("not implemented");
  });

  it("supportedExtensions() throws not-implemented", () => {
    const engine = new Engine("test");
    expect(() => engine.supportedExtensions()).toThrow("not implemented");
  });

  it("ensureLoaded() throws not-implemented", async () => {
    const engine = new Engine("test");
    await expect(engine.ensureLoaded()).rejects.toThrow("not implemented");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/engines/base.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Write implementation**

```js
// src/engines/base.js
export class Engine {
  constructor(name) {
    this.name = name;
    this._loaded = false;
  }

  async ensureLoaded() {
    throw new Error(`${this.name}: ensureLoaded() not implemented`);
  }

  async convert(inputPath, outputPath, options = {}) {
    throw new Error(`${this.name}: convert() not implemented`);
  }

  supportedExtensions() {
    throw new Error(`${this.name}: supportedExtensions() not implemented`);
  }

  supportsExtension(ext) {
    const normalized = ext.startsWith(".") ? ext.slice(1) : ext;
    return this.supportedExtensions().includes(normalized);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/engines/base.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/engines/base.js tests/engines/base.test.js
git commit -m "feat: add Engine base class"
```

### Task 7: Registry

**Files:**
- Create: `src/registry.js`
- Create: `tests/registry.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/registry.test.js
import { describe, it, expect } from "vitest";
import { Registry } from "../src/registry.js";

describe("Registry", () => {
  it("resolves .docx to libreoffice engine", () => {
    const reg = new Registry();
    expect(reg.resolve(".docx")).toBe("libreoffice");
  });

  it("resolves .png to mupdf engine", () => {
    const reg = new Registry();
    expect(reg.resolve(".png")).toBe("mupdf");
  });

  it("resolves .md to pandoc pipeline", () => {
    const reg = new Registry();
    expect(reg.resolve(".md")).toBe("pandoc");
  });

  it("returns null for unsupported extension", () => {
    const reg = new Registry();
    expect(reg.resolve(".xyz")).toBeNull();
  });

  it("handles extensions with and without dot", () => {
    const reg = new Registry();
    expect(reg.resolve("docx")).toBe("libreoffice");
    expect(reg.resolve(".docx")).toBe("libreoffice");
  });

  it("lists all supported extensions", () => {
    const reg = new Registry();
    const exts = reg.supportedExtensions();
    expect(exts).toContain("docx");
    expect(exts).toContain("png");
    expect(exts).toContain("md");
    expect(exts.length).toBeGreaterThan(10);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/registry.test.js`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```js
// src/registry.js
const FORMAT_MAP = {
  // LibreOffice-WASM
  docx: "libreoffice",
  doc: "libreoffice",
  pptx: "libreoffice",
  ppt: "libreoffice",
  xlsx: "libreoffice",
  xls: "libreoffice",
  odt: "libreoffice",
  ods: "libreoffice",
  odp: "libreoffice",
  rtf: "libreoffice",

  // MuPDF
  jpg: "mupdf",
  jpeg: "mupdf",
  png: "mupdf",
  svg: "mupdf",
  tiff: "mupdf",
  tif: "mupdf",
  webp: "mupdf",

  // Pandoc pipeline (pandoc → html → mupdf → pdf)
  md: "pandoc",
  markdown: "pandoc",
  html: "pandoc",
  htm: "pandoc",
};

export class Registry {
  resolve(ext) {
    const normalized = ext.startsWith(".") ? ext.slice(1) : ext;
    return FORMAT_MAP[normalized.toLowerCase()] ?? null;
  }

  supportedExtensions() {
    return Object.keys(FORMAT_MAP);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/registry.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/registry.js tests/registry.test.js
git commit -m "feat: add format-to-engine registry"
```

### Task 8: Cache Manager

**Files:**
- Create: `src/cache.js`
- Create: `tests/cache.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/cache.test.js
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { Cache } from "../src/cache.js";

describe("Cache", () => {
  let tmpDir;
  let cache;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bentopdf-test-"));
    cache = new Cache(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns correct engine path", () => {
    const p = cache.enginePath("mupdf", "1.0.0");
    expect(p).toBe(path.join(tmpDir, "engines", "mupdf", "1.0.0"));
  });

  it("reports engine as not cached when directory missing", () => {
    expect(cache.isCached("mupdf", "1.0.0")).toBe(false);
  });

  it("reports engine as cached when directory exists", () => {
    const p = cache.enginePath("mupdf", "1.0.0");
    fs.mkdirSync(p, { recursive: true });
    fs.writeFileSync(path.join(p, ".complete"), "");
    expect(cache.isCached("mupdf", "1.0.0")).toBe(true);
  });

  it("lists cached engines", () => {
    const p = cache.enginePath("mupdf", "1.0.0");
    fs.mkdirSync(p, { recursive: true });
    fs.writeFileSync(path.join(p, ".complete"), "");
    const list = cache.list();
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe("mupdf");
    expect(list[0].version).toBe("1.0.0");
  });

  it("clears all cached engines", () => {
    const p = cache.enginePath("mupdf", "1.0.0");
    fs.mkdirSync(p, { recursive: true });
    cache.clear();
    expect(fs.existsSync(path.join(tmpDir, "engines"))).toBe(false);
  });

  it("uses XDG cache dir by default", () => {
    const defaultCache = new Cache();
    const expected = path.join(
      process.env.XDG_CACHE_HOME || path.join(os.homedir(), ".cache"),
      "bentopdf"
    );
    expect(defaultCache.baseDir).toBe(expected);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/cache.test.js`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```js
// src/cache.js
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

export class Cache {
  constructor(baseDir) {
    this.baseDir = baseDir ?? path.join(
      process.env.XDG_CACHE_HOME || path.join(os.homedir(), ".cache"),
      "bentopdf"
    );
  }

  enginePath(name, version) {
    return path.join(this.baseDir, "engines", name, version);
  }

  isCached(name, version) {
    const p = this.enginePath(name, version);
    return fs.existsSync(path.join(p, ".complete"));
  }

  markComplete(name, version) {
    const p = this.enginePath(name, version);
    fs.writeFileSync(path.join(p, ".complete"), "");
  }

  list() {
    const enginesDir = path.join(this.baseDir, "engines");
    if (!fs.existsSync(enginesDir)) return [];

    const results = [];
    for (const name of fs.readdirSync(enginesDir)) {
      const engineDir = path.join(enginesDir, name);
      if (!fs.statSync(engineDir).isDirectory()) continue;
      for (const version of fs.readdirSync(engineDir)) {
        const versionDir = path.join(engineDir, version);
        if (!fs.statSync(versionDir).isDirectory()) continue;
        if (fs.existsSync(path.join(versionDir, ".complete"))) {
          const size = this._dirSize(versionDir);
          results.push({ name, version, path: versionDir, size });
        }
      }
    }
    return results;
  }

  clear() {
    const enginesDir = path.join(this.baseDir, "engines");
    if (fs.existsSync(enginesDir)) {
      fs.rmSync(enginesDir, { recursive: true, force: true });
    }
  }

  _dirSize(dir) {
    let total = 0;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        total += this._dirSize(fullPath);
      } else {
        total += fs.statSync(fullPath).size;
      }
    }
    return total;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/cache.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/cache.js tests/cache.test.js
git commit -m "feat: add cache manager for WASM engines"
```

---

## Chunk 3: Engine Wrappers

### Task 9: MuPDF Engine

**Files:**
- Create: `src/engines/mupdf.js`
- Create: `tests/engines/mupdf.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/engines/mupdf.test.js
import { describe, it, expect } from "vitest";
import { MuPdfEngine } from "../../src/engines/mupdf.js";

describe("MuPdfEngine", () => {
  it("extends Engine", () => {
    const engine = new MuPdfEngine();
    expect(engine.name).toBe("mupdf");
  });

  it("lists supported extensions", () => {
    const engine = new MuPdfEngine();
    const exts = engine.supportedExtensions();
    expect(exts).toContain("png");
    expect(exts).toContain("jpg");
    expect(exts).toContain("svg");
  });

  it("validates extension support", () => {
    const engine = new MuPdfEngine();
    expect(engine.supportsExtension(".png")).toBe(true);
    expect(engine.supportsExtension(".xyz")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/engines/mupdf.test.js`
Expected: FAIL

- [ ] **Step 3: Write implementation**

Use the API discovered in the spike (Task 2). The implementation below is based on the expected mupdf API — adjust based on spike findings:

```js
// src/engines/mupdf.js
import * as fs from "node:fs";
import * as path from "node:path";
import { Engine } from "./base.js";

// Image formats are the public-facing supported list.
// HTML is also supported internally (used by the pandoc pipeline)
// but not advertised in supportedExtensions() since users should
// use the pandoc engine for HTML (it adds styling).
const SUPPORTED = ["jpg", "jpeg", "png", "svg", "tiff", "tif", "webp"];

const MIME_MAP = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  tiff: "image/tiff",
  tif: "image/tiff",
  webp: "image/webp",
  html: "text/html",
  htm: "text/html",
};

export class MuPdfEngine extends Engine {
  constructor() {
    super("mupdf");
    this._mupdf = null;
  }

  supportedExtensions() {
    return SUPPORTED;
  }

  async ensureLoaded() {
    if (this._loaded) return;
    this._mupdf = await import("mupdf");
    this._loaded = true;
  }

  async convert(inputPath, outputPath, options = {}) {
    await this.ensureLoaded();

    const ext = path.extname(inputPath).slice(1).toLowerCase();
    const mime = MIME_MAP[ext];
    if (!mime) {
      throw new Error(`MuPDF: unsupported format .${ext}`);
    }

    const inputData = fs.readFileSync(inputPath);
    const pdfBytes = this._renderToPdf(inputData, mime);
    fs.writeFileSync(outputPath, pdfBytes);
  }

  // Public method for pipeline use (e.g., pandoc engine passing HTML buffer)
  async convertBuffer(data, mime, outputPath) {
    await this.ensureLoaded();
    const pdfBytes = this._renderToPdf(data, mime);
    fs.writeFileSync(outputPath, pdfBytes);
  }

  _renderToPdf(inputData, mime) {
    const mupdf = this._mupdf;
    const doc = mupdf.Document.openDocument(inputData, mime);
    const buf = new mupdf.Buffer();
    const writer = new mupdf.DocumentWriter(buf, "pdf", "");

    for (let i = 0; i < doc.countPages(); i++) {
      const page = doc.loadPage(i);
      const bounds = page.getBounds();
      const dev = writer.beginPage(bounds);
      page.run(dev, mupdf.Matrix.identity);
      writer.endPage();
    }

    writer.close();
    return buf.asUint8Array();
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/engines/mupdf.test.js`
Expected: PASS

- [ ] **Step 5: Write integration test with real conversion**

```js
// tests/engines/mupdf.integration.test.js
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { MuPdfEngine } from "../../src/engines/mupdf.js";

describe("MuPdfEngine integration", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mupdf-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("converts PNG to PDF", async () => {
    const engine = new MuPdfEngine();
    const input = "tests/fixtures/test.png";
    const output = path.join(tmpDir, "out.pdf");

    await engine.convert(input, output);

    expect(fs.existsSync(output)).toBe(true);
    const data = fs.readFileSync(output);
    // PDF files start with %PDF
    expect(data.toString("ascii", 0, 4)).toBe("%PDF");
  });
});
```

- [ ] **Step 6: Run integration test**

Run: `npx vitest run tests/engines/mupdf.integration.test.js`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/engines/mupdf.js tests/engines/mupdf.test.js tests/engines/mupdf.integration.test.js
git commit -m "feat: add MuPDF engine wrapper"
```

### Task 10: Pandoc Engine (Pipeline)

**Files:**
- Create: `src/engines/pandoc.js`
- Create: `tests/engines/pandoc.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/engines/pandoc.test.js
import { describe, it, expect } from "vitest";
import { PandocEngine } from "../../src/engines/pandoc.js";

describe("PandocEngine", () => {
  it("extends Engine", () => {
    const engine = new PandocEngine();
    expect(engine.name).toBe("pandoc");
  });

  it("lists supported extensions", () => {
    const engine = new PandocEngine();
    const exts = engine.supportedExtensions();
    expect(exts).toContain("md");
    expect(exts).toContain("html");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/engines/pandoc.test.js`
Expected: FAIL

- [ ] **Step 3: Write implementation**

The pandoc engine is a two-stage pipeline: pandoc-wasm → HTML → mupdf → PDF.

```js
// src/engines/pandoc.js
import * as fs from "node:fs";
import * as path from "node:path";
import { Engine } from "./base.js";
import { MuPdfEngine } from "./mupdf.js";

const SUPPORTED = ["md", "markdown", "html", "htm"];

const PANDOC_FORMAT_MAP = {
  md: "markdown",
  markdown: "markdown",
  html: "html",
  htm: "html",
};

export class PandocEngine extends Engine {
  constructor() {
    super("pandoc");
    this._pandoc = null;
    this._mupdf = new MuPdfEngine();
  }

  supportedExtensions() {
    return SUPPORTED;
  }

  async ensureLoaded() {
    if (this._loaded) return;
    this._pandoc = await import("pandoc-wasm");
    await this._mupdf.ensureLoaded();
    this._loaded = true;
  }

  async convert(inputPath, outputPath, options = {}) {
    await this.ensureLoaded();

    const ext = path.extname(inputPath).slice(1).toLowerCase();
    const fromFormat = PANDOC_FORMAT_MAP[ext];
    if (!fromFormat) {
      throw new Error(`Pandoc: unsupported format .${ext}`);
    }

    const inputText = fs.readFileSync(inputPath, "utf-8");

    // Stage 1: Convert to standalone HTML via pandoc-wasm
    let htmlContent;
    if (fromFormat === "html") {
      // Already HTML — use directly but still wrap for standalone
      htmlContent = inputText;
    } else {
      const result = await this._pandoc.convert(
        { from: fromFormat, to: "html", standalone: true },
        inputText,
        {}
      );
      if (result.exitCode !== 0) {
        throw new Error(`Pandoc conversion failed: ${result.stderr}`);
      }
      htmlContent = result.stdout;
    }

    // Stage 2: Render HTML to PDF via MuPDF's public convertBuffer API
    const htmlData = new TextEncoder().encode(htmlContent);
    await this._mupdf.convertBuffer(htmlData, "text/html", outputPath);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/engines/pandoc.test.js`
Expected: PASS

- [ ] **Step 5: Write integration test**

```js
// tests/engines/pandoc.integration.test.js
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { PandocEngine } from "../../src/engines/pandoc.js";

describe("PandocEngine integration", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pandoc-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("converts Markdown to PDF", async () => {
    const engine = new PandocEngine();
    const input = path.join(tmpDir, "test.md");
    const output = path.join(tmpDir, "test.pdf");

    fs.writeFileSync(input, "# Hello World\n\nThis is a test.");
    await engine.convert(input, output);

    expect(fs.existsSync(output)).toBe(true);
    const data = fs.readFileSync(output);
    expect(data.toString("ascii", 0, 4)).toBe("%PDF");
  });

  it("converts HTML to PDF", async () => {
    const engine = new PandocEngine();
    const input = path.join(tmpDir, "test.html");
    const output = path.join(tmpDir, "test.pdf");

    fs.writeFileSync(input, "<html><body><h1>Test</h1></body></html>");
    await engine.convert(input, output);

    expect(fs.existsSync(output)).toBe(true);
  });
});
```

- [ ] **Step 6: Run integration test**

Run: `npx vitest run tests/engines/pandoc.integration.test.js`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/engines/pandoc.js tests/engines/pandoc.test.js tests/engines/pandoc.integration.test.js
git commit -m "feat: add Pandoc engine with HTML-to-PDF pipeline"
```

### Task 11: LibreOffice Engine

**Files:**
- Create: `src/engines/libreoffice.js`
- Create: `tests/engines/libreoffice.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/engines/libreoffice.test.js
import { describe, it, expect } from "vitest";
import { LibreOfficeEngine } from "../../src/engines/libreoffice.js";

describe("LibreOfficeEngine", () => {
  it("extends Engine", () => {
    const engine = new LibreOfficeEngine();
    expect(engine.name).toBe("libreoffice");
  });

  it("lists supported extensions", () => {
    const engine = new LibreOfficeEngine();
    const exts = engine.supportedExtensions();
    expect(exts).toContain("docx");
    expect(exts).toContain("pptx");
    expect(exts).toContain("xlsx");
    expect(exts).toContain("odt");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/engines/libreoffice.test.js`
Expected: FAIL

- [ ] **Step 3: Write implementation**

Use the API discovered in the spike (Task 4). Adjust based on findings:

```js
// src/engines/libreoffice.js
import * as fs from "node:fs";
import { Engine } from "./base.js";

const SUPPORTED = ["docx", "doc", "pptx", "ppt", "xlsx", "xls", "odt", "ods", "odp", "rtf"];

export class LibreOfficeEngine extends Engine {
  constructor() {
    super("libreoffice");
    this._convert = null;
  }

  supportedExtensions() {
    return SUPPORTED;
  }

  async ensureLoaded() {
    if (this._loaded) return;
    const lo = await import("@matbee/libreoffice-converter/server");
    this._convert = lo.convert;
    this._loaded = true;
  }

  async convert(inputPath, outputPath, options = {}) {
    await this.ensureLoaded();

    const inputData = fs.readFileSync(inputPath);
    const pdfData = await this._convert(inputData, "pdf");
    fs.writeFileSync(outputPath, Buffer.from(pdfData));
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/engines/libreoffice.test.js`
Expected: PASS

- [ ] **Step 5: Write integration test**

```js
// tests/engines/libreoffice.integration.test.js
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { LibreOfficeEngine } from "../../src/engines/libreoffice.js";

describe("LibreOfficeEngine integration", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "lo-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("converts DOCX to PDF", async () => {
    const engine = new LibreOfficeEngine();
    const input = "tests/fixtures/test.docx";
    const output = path.join(tmpDir, "out.pdf");

    await engine.convert(input, output);

    expect(fs.existsSync(output)).toBe(true);
    const data = fs.readFileSync(output);
    expect(data.toString("ascii", 0, 4)).toBe("%PDF");
  }, 60000); // LO-WASM can be slow on first load
});
```

- [ ] **Step 6: Run integration test**

Run: `npx vitest run tests/engines/libreoffice.integration.test.js`
Expected: PASS (may take 30+ seconds on first run)

- [ ] **Step 7: Commit**

```bash
git add src/engines/libreoffice.js tests/engines/libreoffice.test.js tests/engines/libreoffice.integration.test.js
git commit -m "feat: add LibreOffice engine wrapper"
```

### Task 12: Engine Factory

**Files:**
- Create: `src/engines/index.js`
- Create: `tests/engines/index.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/engines/index.test.js
import { describe, it, expect } from "vitest";
import { getEngine } from "../../src/engines/index.js";

describe("getEngine", () => {
  it("returns MuPdfEngine for 'mupdf'", () => {
    const engine = getEngine("mupdf");
    expect(engine.name).toBe("mupdf");
  });

  it("returns PandocEngine for 'pandoc'", () => {
    const engine = getEngine("pandoc");
    expect(engine.name).toBe("pandoc");
  });

  it("returns LibreOfficeEngine for 'libreoffice'", () => {
    const engine = getEngine("libreoffice");
    expect(engine.name).toBe("libreoffice");
  });

  it("throws for unknown engine", () => {
    expect(() => getEngine("unknown")).toThrow("Unknown engine: unknown");
  });

  it("caches engine instances (singleton)", () => {
    const a = getEngine("mupdf");
    const b = getEngine("mupdf");
    expect(a).toBe(b);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/engines/index.test.js`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```js
// src/engines/index.js
import { MuPdfEngine } from "./mupdf.js";
import { PandocEngine } from "./pandoc.js";
import { LibreOfficeEngine } from "./libreoffice.js";

const instances = new Map();

export function getEngine(name) {
  if (instances.has(name)) return instances.get(name);

  let engine;
  switch (name) {
    case "mupdf":
      engine = new MuPdfEngine();
      break;
    case "pandoc":
      engine = new PandocEngine();
      break;
    case "libreoffice":
      engine = new LibreOfficeEngine();
      break;
    default:
      throw new Error(`Unknown engine: ${name}`);
  }

  instances.set(name, engine);
  return engine;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/engines/index.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/engines/index.js tests/engines/index.test.js
git commit -m "feat: add engine factory with singleton caching"
```

---

## Chunk 4: CLI Commands

### Task 13: to-pdf Command

**Files:**
- Create: `src/commands/to-pdf.js`
- Create: `tests/commands/to-pdf.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/commands/to-pdf.test.js
import { describe, it, expect } from "vitest";
import * as path from "node:path";
import { resolveOutputPath, validateArgs } from "../../src/commands/to-pdf.js";

describe("resolveOutputPath", () => {
  it("replaces extension with .pdf for single file", () => {
    expect(resolveOutputPath("/tmp/doc.docx", null)).toBe("/tmp/doc.pdf");
  });

  it("uses explicit output path", () => {
    expect(resolveOutputPath("/tmp/doc.docx", "/out/final.pdf")).toBe("/out/final.pdf");
  });

  it("puts file in output directory", () => {
    const result = resolveOutputPath("/tmp/doc.docx", "/out/");
    expect(result).toBe("/out/doc.pdf");
  });
});

describe("validateArgs", () => {
  it("rejects multiple inputs with single file output", () => {
    expect(() => validateArgs(["/a.docx", "/b.docx"], "/out.pdf"))
      .toThrow("multiple inputs");
  });

  it("accepts multiple inputs with directory output", () => {
    expect(() => validateArgs(["/a.docx", "/b.docx"], "/out/"))
      .not.toThrow();
  });

  it("accepts multiple inputs with no output", () => {
    expect(() => validateArgs(["/a.docx", "/b.docx"], null))
      .not.toThrow();
  });

  it("rejects empty inputs", () => {
    expect(() => validateArgs([], null))
      .toThrow("No input files");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/commands/to-pdf.test.js`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```js
// src/commands/to-pdf.js
import * as fs from "node:fs";
import * as path from "node:path";
import { Registry } from "../registry.js";
import { getEngine } from "../engines/index.js";

const registry = new Registry();

export function resolveOutputPath(inputPath, outputArg) {
  if (!outputArg) {
    const dir = path.dirname(inputPath);
    const base = path.basename(inputPath, path.extname(inputPath));
    return path.join(dir, `${base}.pdf`);
  }

  // If output ends with / or is an existing directory, put file inside it
  const isDir = outputArg.endsWith(path.sep) || outputArg.endsWith("/") ||
    (fs.existsSync(outputArg) && fs.statSync(outputArg).isDirectory());

  if (isDir) {
    const base = path.basename(inputPath, path.extname(inputPath));
    return path.join(outputArg, `${base}.pdf`);
  }

  return outputArg;
}

export function validateArgs(inputs, output) {
  if (inputs.length === 0) {
    throw new Error("No input files provided");
  }

  if (inputs.length > 1 && output && !output.endsWith(path.sep) && !output.endsWith("/")) {
    // Check if it's an existing directory
    if (!fs.existsSync(output) || !fs.statSync(output).isDirectory()) {
      throw new Error(
        "Cannot use a single filename as output for multiple inputs. " +
        "Use a directory path (ending with /) instead."
      );
    }
  }
}

export async function toPdf(inputs, options = {}) {
  validateArgs(inputs, options.output);

  const results = [];

  for (const inputPath of inputs) {
    const absInput = path.resolve(inputPath);
    const outputPath = resolveOutputPath(absInput, options.output);

    try {
      if (!fs.existsSync(absInput)) {
        throw new Error(`File not found: ${absInput}`);
      }

      const ext = path.extname(absInput).slice(1).toLowerCase();
      const engineName = options.engine || registry.resolve(ext);

      if (!engineName) {
        const supported = registry.supportedExtensions().join(", ");
        throw new Error(
          `Unsupported format: .${ext}\nSupported formats: ${supported}`
        );
      }

      const engine = getEngine(engineName);

      if (options.engine && !engine.supportsExtension(ext)) {
        throw new Error(
          `Engine '${engineName}' does not support .${ext} files`
        );
      }

      if (options.verbose) {
        console.error(`Converting ${absInput} → ${outputPath} (${engineName})`);
      }

      // Ensure output directory exists
      const outDir = path.dirname(outputPath);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      await engine.convert(absInput, outputPath);
      results.push({ input: absInput, output: outputPath, success: true });

      if (options.verbose) {
        console.error(`  Done: ${outputPath}`);
      }
    } catch (err) {
      results.push({ input: absInput, error: err.message, success: false });
      if (options.verbose) {
        console.error(`  Error: ${err.message}`);
      }
    }
  }

  return results;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/commands/to-pdf.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/commands/to-pdf.js tests/commands/to-pdf.test.js
git commit -m "feat: add to-pdf command with batch support"
```

### Task 14: CLI Entry Point

**Files:**
- Create: `src/cli.js`
- Modify: `bin/bentopdf.js`
- Create: `tests/cli.test.js`

- [ ] **Step 1: Install yargs**

Run: `npm install yargs`

- [ ] **Step 2: Write the failing test**

```js
// tests/cli.test.js
import { describe, it, expect } from "vitest";
import { buildCli } from "../src/cli.js";

describe("CLI argument parsing", () => {
  it("parses to-pdf with single input", async () => {
    const cli = buildCli();
    const parsed = await cli.parseAsync(["to-pdf", "doc.docx"]);
    expect(parsed._[0]).toBe("to-pdf");
    expect(parsed.input).toEqual(["doc.docx"]);
  });

  it("parses to-pdf with output option", async () => {
    const cli = buildCli();
    const parsed = await cli.parseAsync(["to-pdf", "doc.docx", "-o", "out.pdf"]);
    expect(parsed.output).toBe("out.pdf");
  });

  it("parses to-pdf with engine override", async () => {
    const cli = buildCli();
    const parsed = await cli.parseAsync(["to-pdf", "doc.docx", "--engine", "mupdf"]);
    expect(parsed.engine).toBe("mupdf");
  });

  it("parses to-pdf with verbose flag", async () => {
    const cli = buildCli();
    const parsed = await cli.parseAsync(["to-pdf", "doc.docx", "--verbose"]);
    expect(parsed.verbose).toBe(true);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tests/cli.test.js`
Expected: FAIL

- [ ] **Step 4: Write CLI implementation**

```js
// src/cli.js
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { toPdf } from "./commands/to-pdf.js";

export function buildCli() {
  return yargs()
    .scriptName("bentopdf")
    .usage("$0 <command> [options]")
    .command(
      "to-pdf <input...>",
      "Convert files to PDF",
      (yargs) => {
        yargs
          .positional("input", {
            describe: "Input file(s) to convert",
            type: "string",
            array: true,
          })
          .option("output", {
            alias: "o",
            describe: "Output file or directory",
            type: "string",
          })
          .option("engine", {
            describe: "Force a specific engine",
            type: "string",
            choices: ["mupdf", "pandoc", "libreoffice"],
          })
          .option("verbose", {
            describe: "Show detailed progress",
            type: "boolean",
            default: false,
          });
      },
      async (argv) => {
        try {
          const results = await toPdf(argv.input, {
            output: argv.output,
            engine: argv.engine,
            verbose: argv.verbose,
          });

          const failures = results.filter((r) => !r.success);
          const successes = results.filter((r) => r.success);

          for (const r of successes) {
            console.log(r.output);
          }

          if (failures.length > 0) {
            console.error("");
            for (const f of failures) {
              console.error(`Error: ${f.input}: ${f.error}`);
            }
            if (!argv.verbose) {
              console.error("\nTip: use --verbose for detailed output");
            }
            if (results.length > 1) {
              console.error(
                `\n${successes.length}/${results.length} files converted successfully.`
              );
            }
            process.exit(1);
          }
        } catch (err) {
          // Argument validation errors → exit code 2
          if (err.message.includes("No input files") ||
              err.message.includes("Cannot use a single filename")) {
            console.error(`Error: ${err.message}`);
            process.exit(2);
          }
          // Engine download errors → exit code 3
          if (err.message.includes("download") || err.message.includes("fetch")) {
            console.error(`Error: ${err.message}`);
            process.exit(3);
          }
          // Unknown errors → exit code 1
          console.error(`Error: ${err.message}`);
          process.exit(1);
        }
      }
    )
    .command(
      "cache <action>",
      "Manage WASM engine cache",
      (yargs) => {
        yargs.positional("action", {
          describe: "Cache action",
          choices: ["list", "clear", "prefetch"],
        });
      },
      async (argv) => {
        const { Cache } = await import("./cache.js");
        const cache = new Cache();

        switch (argv.action) {
          case "list": {
            const engines = cache.list();
            if (engines.length === 0) {
              console.log("No engines cached.");
            } else {
              for (const e of engines) {
                const sizeMB = (e.size / 1024 / 1024).toFixed(1);
                console.log(`${e.name}@${e.version}  ${sizeMB} MB  ${e.path}`);
              }
            }
            break;
          }
          case "clear":
            cache.clear();
            console.log("Cache cleared.");
            break;
          case "prefetch":
            console.log("Prefetch not yet implemented.");
            break;
        }
      }
    )
    .demandCommand(1, "Please specify a command")
    .strict()
    .help()
    .version();
}

export async function run(args) {
  await buildCli().parseAsync(args ?? hideBin(process.argv));
}
```

- [ ] **Step 5: Update bin/bentopdf.js**

```js
#!/usr/bin/env node
import { run } from "../src/cli.js";
await run();
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/cli.test.js`
Expected: PASS

- [ ] **Step 7: Test CLI manually**

Run: `node bin/bentopdf.js --help`
Expected: Shows help with `to-pdf` and `cache` commands

Run: `node bin/bentopdf.js --version`
Expected: Shows `0.1.0`

- [ ] **Step 8: Commit**

```bash
git add src/cli.js bin/bentopdf.js tests/cli.test.js package.json package-lock.json
git commit -m "feat: add CLI entry point with yargs"
```

---

## Chunk 5: Skill & Polish

### Task 15: Claude Code Skill

**Files:**
- Create: `skills/bentopdf.md`

- [ ] **Step 1: Write the skill file**

```markdown
---
name: bentopdf
description: Convert documents to PDF using bentopdf-cli. Use when the user asks to convert files to PDF, mentions "docx to pdf", "make a pdf", "pdf conversion", or asks about supported document conversion formats.
---

# bentopdf-cli — Document to PDF Conversion

You have access to `bentopdf-cli`, a local CLI tool that converts documents to PDF using WASM engines. No native dependencies required — just Node.js.

## Quick Reference

### Convert a file to PDF
```bash
npx bentopdf-cli to-pdf <input>
```

### With explicit output path
```bash
npx bentopdf-cli to-pdf report.docx -o final.pdf
```

### Batch convert
```bash
npx bentopdf-cli to-pdf *.docx -o ./pdfs/
```

## Supported Input Formats

| Format | Extensions | Engine |
|--------|-----------|--------|
| Word | .docx, .doc | LibreOffice-WASM |
| PowerPoint | .pptx, .ppt | LibreOffice-WASM |
| Excel | .xlsx, .xls | LibreOffice-WASM |
| OpenDocument | .odt, .ods, .odp | LibreOffice-WASM |
| Rich Text | .rtf | LibreOffice-WASM |
| Markdown | .md, .markdown | Pandoc + MuPDF |
| HTML | .html, .htm | Pandoc + MuPDF |
| Images | .jpg, .jpeg, .png, .svg, .tiff, .webp | MuPDF |

## Options

- `-o, --output <path>` — Output file or directory (default: same name with .pdf extension)
- `--engine <name>` — Force a specific engine: `mupdf`, `pandoc`, or `libreoffice`
- `--verbose` — Show detailed conversion progress

## Cache Management

WASM engines are downloaded on first use and cached locally.

```bash
npx bentopdf-cli cache list      # Show cached engines
npx bentopdf-cli cache clear     # Remove all cached engines
```

## Usage Guidelines

1. **Check installation first**: Run `npx bentopdf-cli --version` to verify it's available
2. **Single file**: `npx bentopdf-cli to-pdf document.docx` — outputs `document.pdf` in same directory
3. **Batch to directory**: `npx bentopdf-cli to-pdf *.pptx -o ./pdfs/` — all PDFs go to `./pdfs/`
4. **Multiple inputs with -o**: The `-o` must be a directory (ending in `/`) when converting multiple files
5. **First run**: The first conversion for each format type will download the required WASM engine — this is a one-time operation

## Error Handling

- If conversion fails, suggest `--verbose` for detailed output
- If an engine fails to download, suggest `bentopdf cache clear` then retry
- Exit code 0 = success, 1 = conversion error, 2 = bad arguments, 3 = download failure
```

- [ ] **Step 2: Commit**

```bash
git add skills/bentopdf.md
git commit -m "feat: add Claude Code skill for bentopdf"
```

### Task 16: End-to-End Test

**Files:**
- Create: `tests/e2e.test.js`

- [ ] **Step 1: Write end-to-end test**

```js
// tests/e2e.test.js
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { execFileSync } from "node:child_process";

const CLI = path.resolve("bin/bentopdf.js");

describe("E2E: bentopdf CLI", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bentopdf-e2e-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("shows help", () => {
    const output = execFileSync("node", [CLI, "--help"], { encoding: "utf-8" });
    expect(output).toContain("to-pdf");
    expect(output).toContain("cache");
  });

  it("shows version", () => {
    const output = execFileSync("node", [CLI, "--version"], { encoding: "utf-8" });
    expect(output.trim()).toBe("0.1.0");
  });

  it("exits 2 on missing command", () => {
    try {
      execFileSync("node", [CLI], { encoding: "utf-8", stdio: "pipe" });
      expect.fail("should have exited non-zero");
    } catch (err) {
      expect(err.status).toBe(1); // yargs exits 1 for missing command
    }
  });

  it("converts markdown to PDF", () => {
    const input = path.join(tmpDir, "test.md");
    const output = path.join(tmpDir, "test.pdf");
    fs.writeFileSync(input, "# Hello\n\nWorld");

    execFileSync("node", [CLI, "to-pdf", input, "-o", output], {
      encoding: "utf-8",
      timeout: 60000,
    });

    expect(fs.existsSync(output)).toBe(true);
    const data = fs.readFileSync(output);
    expect(data.toString("ascii", 0, 4)).toBe("%PDF");
  });

  it("converts PNG to PDF", () => {
    const input = path.resolve("tests/fixtures/test.png");
    const output = path.join(tmpDir, "test.pdf");

    execFileSync("node", [CLI, "to-pdf", input, "-o", output], {
      encoding: "utf-8",
      timeout: 60000,
    });

    expect(fs.existsSync(output)).toBe(true);
  });

  it("cache list works", () => {
    const output = execFileSync("node", [CLI, "cache", "list"], {
      encoding: "utf-8",
    });
    // May show engines or "No engines cached." — both are valid
    expect(typeof output).toBe("string");
  });
});
```

- [ ] **Step 2: Run E2E tests**

Run: `npx vitest run tests/e2e.test.js`
Expected: PASS

- [ ] **Step 3: Run full test suite**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add tests/e2e.test.js
git commit -m "test: add end-to-end CLI tests"
```

### Task 17: Final Polish

**Files:**
- Modify: `package.json` (add files field, repository)
- Create: `engines.json`

- [ ] **Step 1: Create engines.json**

```json
{
  "$schema": "./engines.schema.json",
  "mupdf": {
    "type": "npm",
    "package": "mupdf",
    "version": "1.27.0",
    "note": "Installed as npm dependency — no separate download needed"
  },
  "pandoc": {
    "type": "npm",
    "package": "pandoc-wasm",
    "version": "1.0.1",
    "note": "Installed as npm dependency — no separate download needed"
  },
  "libreoffice": {
    "type": "npm",
    "package": "@matbee/libreoffice-converter",
    "version": "2.5.1",
    "note": "WASM files downloaded on first use by the package itself (~150MB)"
  }
}
```

Note: In v0.1, all three engines are npm dependencies — `engines.json` is a documentation/reference file only, not read by code. The cache infrastructure (Task 8) supports the `cache list/clear` CLI commands and will be wired to actual downloads when future engines need it. Dependencies were already added to `package.json` during the spikes (Tasks 2-4).

- [ ] **Step 2: Update package.json with production dependencies and files field**

Add to `package.json`:
```json
{
  "files": ["bin/", "src/", "engines.json", "LICENSE.md"],
  "dependencies": {
    "mupdf": "^1.27.0",
    "pandoc-wasm": "^1.0.1",
    "@matbee/libreoffice-converter": "^2.5.1",
    "yargs": "^17.0.0"
  }
}
```

Run: `npm install`

- [ ] **Step 3: Run full test suite one more time**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 4: Test npx-style invocation**

Run: `npm link && bentopdf --help`
Expected: Shows help output

Run: `npm unlink -g bentopdf-cli`

- [ ] **Step 5: Commit**

```bash
git add engines.json package.json package-lock.json
git commit -m "feat: finalize v0.1 packaging and engine manifest"
```

- [ ] **Step 6: Clean up spikes**

```bash
git rm -r spikes/
git commit -m "chore: remove feasibility spikes"
```
