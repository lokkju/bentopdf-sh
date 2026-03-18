import * as fs from "node:fs";
import * as path from "node:path";
import { createRequire } from "node:module";
import { Engine } from "./base.js";

const SUPPORTED = ["docx", "doc", "pptx", "ppt", "xlsx", "xls", "odt", "ods", "odp", "rtf"];

export class LibreOfficeEngine extends Engine {
  constructor() {
    super("libreoffice");
    this._converter = null;
  }

  supportedExtensions() {
    return SUPPORTED;
  }

  async ensureLoaded() {
    if (this._loaded) return;

    const { LibreOfficeConverter } = await import("@matbee/libreoffice-converter/server");
    const require = createRequire(import.meta.url);
    const wasmLoader = require("@matbee/libreoffice-converter/wasm/loader");

    this._converter = new LibreOfficeConverter({ wasmLoader });
    await this._converter.initialize();
    this._loaded = true;
  }

  async convert(inputPath, outputPath, options = {}) {
    await this.ensureLoaded();

    const ext = path.extname(inputPath).slice(1).toLowerCase();
    const inputData = fs.readFileSync(inputPath);

    const result = await this._converter.convert(inputData, {
      outputFormat: "pdf",
      inputFormat: ext,
    });

    fs.writeFileSync(outputPath, Buffer.from(result.data));
  }
}
