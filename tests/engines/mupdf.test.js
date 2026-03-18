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
