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
      // Already HTML — use directly
      htmlContent = inputText;
    } else {
      const result = await this._pandoc.convert(
        { from: fromFormat, to: "html", standalone: true },
        inputText,
        {}
      );
      if (result.stderr) {
        // pandoc-wasm has no exitCode; check stderr for errors
        console.error(`Pandoc warnings: ${result.stderr}`);
      }
      htmlContent = result.stdout;
    }

    // Stage 2: Render HTML to PDF via MuPDF's public convertBuffer API
    const htmlData = new TextEncoder().encode(htmlContent);
    await this._mupdf.convertBuffer(htmlData, "text/html", outputPath);
  }
}
