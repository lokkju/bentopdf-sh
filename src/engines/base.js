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
