import * as fs from "node:fs";
import * as path from "node:path";
import { Engine } from "./base.js";

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
